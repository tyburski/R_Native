import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Colors} from 'react-native/Libraries/NewAppScreen';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [addPostOpen, setAddPostOpen] = useState<boolean>(false);
  const [addCommentOpen, setAddCommentOpen] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [currentPost, setCurrentPost] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    handleUser();
    fetchPosts();
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserId();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get<Post[]>(
        'https://jsonplaceholder.typicode.com/posts',
      );
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<any[]>(
        'https://jsonplaceholder.typicode.com/users',
      );
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const sortedPosts = posts.sort((a, b) => b.id - a.id);
  const currentPosts = sortedPosts.slice(startIndex, endIndex);
  const pageCount = Math.ceil(posts.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      handlePageChange(currentPage + 1);
    }
  };

  const getAuthor = (userId: number): string => {
    const user = users.find(user => user.id === userId);
    return user ? `${user.email}` : 'Nieznany';
  };

  const handleOpenLightbox = async (postId: number) => {
    try {
      const response = await axios.get<Comment[]>(
        `https://jsonplaceholder.typicode.com/comments?postId=${postId}`,
      );
      setComments(response.data);
      setLightboxOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setShow(!!userId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPost = () => {
    setAddPostOpen(true);
  };

  const handleAddComment = (postId: number) => {
    setCurrentPost(postId);
    setAddCommentOpen(true);
  };

  const handleNewPost = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error(
          'Nie można dodać postu - brak zalogowanego użytkownika.',
        );
      }

      await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title,
        body,
        userId: JSON.parse(userId),
      });

      Alert.alert('Sukces', 'Pomyślnie dodano post');
      setAddPostOpen(false);
      fetchPosts();
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania postu');
    }
  };

  const handleNewComment = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error(
          'Nie można dodać komentarza - brak zalogowanego użytkownika.',
        );
      }

      await axios.post(
        `https://jsonplaceholder.typicode.com/posts/${currentPost}/comments`,
        {
          body: comment,
          email: userEmail,
        },
      );

      Alert.alert('Sukces', 'Pomyślnie dodano komentarz');
      setAddCommentOpen(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania komentarza');
    }
  };

  const handleEdit = async (postId: number) => {
    setCurrentPost(postId);
    try {
      const response = await axios.get<Post>(
        `https://jsonplaceholder.typicode.com/posts/${postId}`,
      );
      setNewTitle(response.data.title);
      setNewBody(response.data.body);
      setEditMode(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas pobierania danych do edycji');
    }
  };

  const handleEditPost = async () => {
    try {
      await axios.patch(
        `https://jsonplaceholder.typicode.com/posts/${currentPost}`,
        {
          title: newTitle,
          body: newBody,
        },
      );

      Alert.alert('Sukces', 'Pomyślnie zaktualizowano post');
      setEditMode(false);
      fetchPosts();
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizowania postu');
    }
  };

  const handleDelete = (postId: number) => {
    setCurrentPost(postId);
    setDeleteMode(true);
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(
        `https://jsonplaceholder.typicode.com/posts/${currentPost}`,
      );

      Alert.alert('Sukces', 'Pomyślnie usunięto post');
      setDeleteMode(false);
      fetchPosts();
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania postu');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>➲ POSTY</Text>
        {show && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddPost}>
            <Text style={styles.buttonText}>DODAJ POST</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.postsContainer}>
        {currentPosts.map(post => (
          <View key={post.id} style={styles.post}>
            <Text style={styles.author}>{getAuthor(post.userId)}</Text>
            <Text style={styles.postTitle}>{post.title.toUpperCase()}</Text>
            <Text>{post.body}</Text>
            {post.userId.toString() === userId && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(post.id)}>
                  <Text style={styles.buttonText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(post.id)}>
                  <Text style={styles.buttonText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => handleOpenLightbox(post.id)}>
              <Text style={styles.buttonText}>Komentarze</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {lightboxOpen && (
        <View style={styles.lightbox}>
          <View style={styles.lightboxContent}>
            <ScrollView>
              {comments.map(comment => (
                <View key={comment.id} style={styles.comment}>
                  <Text style={styles.commentAuthor}>
                    {comment.email.toUpperCase()}
                  </Text>
                  <Text style={styles.commentTitle}>
                    {comment.name.toUpperCase()}
                  </Text>
                  <Text>{comment.body}</Text>
                </View>
              ))}
            </ScrollView>
            <Button title="Zamknij" onPress={() => setLightboxOpen(false)} />
          </View>
        </View>
      )}

      {addPostOpen && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Tytuł"
              placeholderTextColor={Colors.black}
              style={styles.input}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Treść"
              placeholderTextColor={Colors.black}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <Button title="Dodaj Post" onPress={handleNewPost} />
          </View>
        </View>
      )}

      {addCommentOpen && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>Post: {currentPost}</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Treść"
              placeholderTextColor={Colors.black}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <Button title="Dodaj Komentarz" onPress={handleNewComment} />
          </View>
        </View>
      )}

      {editMode && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Nowy tytuł"
              placeholderTextColor={Colors.black}
              style={styles.input}
            />
            <TextInput
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Nowa treść"
              placeholderTextColor={Colors.black}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <Button title="Zapisz" onPress={handleEditPost} />
          </View>
        </View>
      )}

      {deleteMode && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.pageButtonText}>Czy chcesz usunąć post?</Text>
            <View style={styles.deleteActions}>
              <Button title="Usuń" onPress={handleDeletePost} />
              <Button title="Anuluj" onPress={() => setDeleteMode(false)} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.pagination}>
        <Text style={styles.pageButtonText}>
          Strona {currentPage} z {pageCount}
        </Text>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={handlePrevPage}
          style={styles.pageButton}>
          <Text style={styles.pageButtonText}>Poprzednia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={currentPage === pageCount}
          onPress={handleNextPage}
          style={styles.pageButton}>
          <Text style={styles.pageButtonText}>Następna</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  addButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  postsContainer: {
    backgroundColor: '#CFDFE1',
  },
  post: {
    margin: 10,
    padding: 10,
    backgroundColor: '#81A2A7',
  },
  author: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  commentButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  lightbox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lightboxContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    marginTop: 30,
  },
  comment: {
    marginBottom: 10,
    backgroundColor: '#81A2A7',
    padding: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  commentTitle: {
    fontSize: 16,
    color: 'black',
  },
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 5,
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pageButton: {
    marginLeft: 10,
  },
  pageButtonText: {
    fontSize: 20,
    color: 'black',
  },
});

export default Posts;

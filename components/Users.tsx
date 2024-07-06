import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          'https://jsonplaceholder.typicode.com/users',
        );
        setUsers(response.data);
        await AsyncStorage.setItem('users', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching users', error);
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      }
    };

    fetchUsers();
  }, []);

  const handleOpenLightbox = async (userId: number) => {
    try {
      const response = await axios.get<Todo[]>(
        `https://jsonplaceholder.typicode.com/todos?userId=${userId}`,
      );

      setTodos(response.data);
      await AsyncStorage.setItem(
        `todos_${userId}`,
        JSON.stringify(response.data),
      );
    } catch (error) {
      console.error('Error fetching todos', error);
      const storedTodos = await AsyncStorage.getItem(`todos_${userId}`);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    }

    setLightboxOpen(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➲ UŻYTKOWNICY</Text>
      <FlatList
        data={users}
        keyExtractor={user => user.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleOpenLightbox(item.id)}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={lightboxOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLightboxOpen(false)}>
        <View style={styles.lightboxOverlay}>
          <View style={styles.todoSection}>
            <FlatList
              data={todos}
              keyExtractor={todo => todo.id.toString()}
              renderItem={({item}) => (
                <Text style={styles.todo}>
                  {item.completed ? '✅' : '❌'} {item.title}
                </Text>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },
  userItem: {
    padding: 2,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontSize: 20,
    color: 'black',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  lightboxOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  todoSection: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  todo: {
    fontSize: 16,
    paddingVertical: 4,
    color: 'black',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Users;

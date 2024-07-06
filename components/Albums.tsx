import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import axios from 'axios';

interface Album {
  userId: number;
  id: number;
  title: string;
}

interface AlbumsProps {
  onAlbumSelected: (albumId: number, albumTitle: string) => void;
}

const Albums: React.FC<AlbumsProps> = ({onAlbumSelected}) => {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get<Album[]>(
          'https://jsonplaceholder.typicode.com/albums',
        );
        setAlbums(response.data);
      } catch (error) {
        console.error('Error fetching albums', error);
      }
    };

    fetchAlbums();
  }, []);

  const handleAlbumClick = (album: Album) => {
    onAlbumSelected(album.id, album.title);
  };

  const renderAlbum = ({item}: {item: Album}) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumClick(item)}>
      <Text style={styles.albumTitle}>{item.title.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>➲ ALBUMY</Text>
      <FlatList
        data={albums}
        renderItem={renderAlbum}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.albumGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: 'black',
  },
  albumGrid: {
    alignItems: 'center',
  },
  albumItem: {
    padding: 20,
    marginVertical: 8,
    borderRadius: 2,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#81A2A7',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Albums;

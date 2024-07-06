import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Header from './components/Header';
import Photos from './components/Photos';
import Albums from './components/Albums';
import Posts from './components/Posts';
import Users from './components/Users';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    'photos' | 'albums' | 'posts' | 'users' | 'settings'
  >('posts');
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState<string>('');

  const handleViewChange = (
    mode: 'photos' | 'albums' | 'posts' | 'users' | 'settings',
  ) => {
    setViewMode(mode);
    setSelectedAlbumId(null);
    setSelectedAlbumTitle('');
  };

  const handleAlbumSelected = (albumId: number, albumTitle: string) => {
    setSelectedAlbumId(albumId);
    setSelectedAlbumTitle(albumTitle);
    setViewMode('photos');
  };

  return (
    <View style={styles.app}>
      <Header onViewChange={handleViewChange} />
      {viewMode === 'albums' && (
        <Albums onAlbumSelected={handleAlbumSelected} />
      )}
      {viewMode === 'photos' && (
        <Photos
          selectedAlbumId={selectedAlbumId}
          selectedAlbumTitle={selectedAlbumTitle}
        />
      )}
      {viewMode === 'posts' && <Posts />}
      {viewMode === 'users' && <Users />}
      {viewMode === 'settings' && <Settings />}
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default App;

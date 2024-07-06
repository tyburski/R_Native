import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import axios from 'axios';

interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

interface PhotosProps {
  selectedAlbumId: number | null;
  selectedAlbumTitle: string;
}

const Photos: React.FC<PhotosProps> = ({
  selectedAlbumId,
  selectedAlbumTitle,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        let response;

        if (selectedAlbumId !== null) {
          response = await axios.get<Photo[]>(
            'https://jsonplaceholder.typicode.com/photos',
            {params: {albumId: selectedAlbumId}},
          );
        } else {
          response = await axios.get<Photo[]>(
            'https://jsonplaceholder.typicode.com/photos',
          );
        }

        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching photos', error);
      }
    };
    fetchPhotos();
  }, [selectedAlbumId]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPhotos = photos.slice(startIndex, endIndex);
  const pageCount = Math.ceil(photos.length / pageSize);

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

  const handleOpenLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  const renderPhoto = ({item}: {item: Photo}) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handleOpenLightbox(item)}>
      <Image source={{uri: item.thumbnailUrl}} style={styles.photoThumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {selectedAlbumTitle
          ? selectedAlbumTitle.toUpperCase()
          : 'WSZYSTKIE ZDJĘCIA'}
      </Text>
      <FlatList
        data={currentPhotos}
        renderItem={renderPhoto}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.photoGrid}
      />
      <Modal visible={lightboxOpen} transparent={true}>
        <TouchableOpacity
          style={styles.lightboxOverlay}
          onPress={() => setLightboxOpen(false)}>
          <View style={styles.lightboxContent}>
            <Image
              source={{uri: selectedPhoto?.url}}
              style={styles.lightboxImage}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.pagination}>
        <Text style={styles.pageButtonText}>
          Strona {currentPage} z {pageCount}
        </Text>
        <TouchableOpacity
          onPress={handlePrevPage}
          disabled={currentPage === pageCount}>
          <Text style={styles.pageButtonText}>Poprzednia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === pageCount}>
          <Text style={styles.pageButtonText}>Następna</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: 'black',
  },
  photoGrid: {
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
  },
  photoItem: {
    flex: 1,

    margin: 5,
    marginBottom: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoThumbnail: {
    width: 150,
    height: 150,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    width: '90%',
    height: '45%',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  pageButtonText: {
    fontSize: 20,
    color: 'black',
  },
});

export default Photos;

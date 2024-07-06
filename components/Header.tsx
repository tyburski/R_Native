import React, {useState, useEffect} from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from 'react-native/Libraries/NewAppScreen';

interface HeaderProps {
  onViewChange: (
    mode: 'photos' | 'albums' | 'posts' | 'users' | 'settings',
  ) => void;
}

const Header: React.FC<HeaderProps> = ({onViewChange}) => {
  const [email, setEmail] = useState('');
  const [show, setShow] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleChange = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      setShow(true);
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    handleChange();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users?email=${email}`,
      );
      const users = await response.json();

      if (users.length > 0) {
        Alert.alert('Zalogowano pomyślnie!');
        await AsyncStorage.setItem('userId', users[0].id.toString());
        await AsyncStorage.setItem('userEmail', users[0].email);
        handleChange();
      } else {
        Alert.alert('Użytkownik nie istnieje. Spróbuj ponownie.');
      }
    } catch {
      Alert.alert('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    handleChange();
  };

  return (
    <View style={styles.header}>
      <Button title="POSTY" onPress={() => onViewChange('posts')} />
      <Button title="ALBUMY" onPress={() => onViewChange('albums')} />
      <Button title="ZDJĘCIA" onPress={() => onViewChange('photos')} />
      <Button title="UŻYTKOWNICY" onPress={() => onViewChange('users')} />

      {show && userEmail && <Text style={styles.username}>{userEmail}</Text>}
      {show ? (
        <Pressable
          style={styles.button}
          onPress={() => onViewChange('settings')}>
          <Text style={styles.text}>Ustawienia ⚙</Text>
        </Pressable>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          placeholderTextColor={Colors.black}
          value={email}
          onChangeText={setEmail}
        />
      )}
      {show ? (
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.text}>Wyloguj ✖</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.text}>ZALOGUJ ⎆</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 0,
    justifyContent: 'space-between',
    backgroundColor: '#CFDFE1',
  },
  username: {
    fontSize: 16,
    marginTop: 30,
    color: 'black',
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'transparent',
    padding: 5,
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
  input: {
    height: 30,
    width: 250,
    color: 'black',
    fontSize: 16,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 30,
    padding: 0,
    paddingLeft: 5,
    flexDirection: 'row',
  },
});

export default Header;

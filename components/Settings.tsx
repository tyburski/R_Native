import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, Alert, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const Settings: React.FC = () => {
  const [email, setEmail] = useState('');
  const [repeat, setRepeat] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string | null>('');

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      setCurrentEmail(storedEmail);
    };

    fetchEmail();
  }, []);

  const changeEmail = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log(userId);

      if (email === repeat) {
        await fetch('https://jsonplaceholder.typicode.com/users/1', {
          method: 'PUT',
          body: JSON.stringify({
            email: email,
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        })
          .then(response => response.json())
          .then(json => console.log(json));

        await AsyncStorage.setItem('userEmail', email);
        setCurrentEmail(email);
        Alert.alert('Sukces', 'Email zmieniony pomyślnie!');
      } else {
        Alert.alert('Błąd', 'Podane dane są niepoprawne. Spróbuj ponownie.');
      }
    } catch {
      Alert.alert('Błąd', 'Wystąpił błąd. Spróbuj ponownie.');
    }
  };

  return (
    <View style={styles.settings}>
      <Text style={styles.heading}>➲ USTAWIENIA</Text>
      <View>
        <Text>{currentEmail}</Text>
      </View>
      <View style={styles.settingsEmail}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="NOWY EMAIL"
          placeholderTextColor={Colors.black}
          style={styles.input}
        />
        <TextInput
          value={repeat}
          onChangeText={setRepeat}
          placeholder="POWTÓRZ EMAIL"
          placeholderTextColor={Colors.black}
          style={styles.input}
        />
      </View>
      <Button title="POTWIERDŹ" onPress={changeEmail} />
    </View>
  );
};

const styles = StyleSheet.create({
  settings: {
    padding: 10,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  settingsEmail: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 5,
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
});

export default Settings;

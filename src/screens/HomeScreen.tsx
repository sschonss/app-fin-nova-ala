import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen = () => {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
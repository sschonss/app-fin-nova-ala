import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export const InfoScreen = () => {
  const [location, setLocation] = useState({
    latitude: -25.380994,
    longitude: -51.471657,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da permissão de localização para mostrar sua posição no mapa.');
        return;
      }
    })();
  }, []);

  const handleCopyPix = async () => {
    await Clipboard.setStringAsync('111.339.119-78');
    Alert.alert('Sucesso', 'Chave PIX copiada para a área de transferência!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏆 Futsal - Nova Ala 🏆</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário e Local</Text>
          <Text style={styles.text}>📅 Jogos toda terça-feira</Text>
          <Text style={styles.text}>🕘 Horário: 21h - 22h</Text>
          <Text style={styles.text}>📍 Local: R. Gralha Azul, 276</Text>
          <Text style={styles.text}>São Cristóvão, Guarapuava - PR</Text>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={location}
              showsUserLocation={true}
            >
              <Marker
                coordinate={{
                  latitude: -25.380994,
                  longitude: -51.471657,
                }}
                title="Nova Ala Futsal"
                description="R. Gralha Azul, 276"
              />
            </MapView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vagas Disponíveis</Text>
          <Text style={styles.text}>• 3 Goleiros</Text>
          <Text style={styles.text}>• 12 Jogadores de linha</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <Text style={styles.text}>💰 Mensalidade: R$ 40,00</Text>
          <Text style={styles.subtext}>(pagamento no primeiro jogo do mês)</Text>
          <Text style={styles.text}>🎟 Atletas convidados: R$ 15,00 por jogo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Bancários</Text>
          <TouchableOpacity onPress={handleCopyPix} style={styles.pixContainer}>
            <View>
              <Text style={styles.text}>PIX: 111.339.119-78</Text>
              <Text style={styles.subtext}>Nubank - Luiz Schons</Text>
            </View>
            <Ionicons name="copy-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pixContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    marginTop: 10,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
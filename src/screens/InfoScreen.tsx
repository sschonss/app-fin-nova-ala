import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Linking, Platform } from 'react-native';
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

  const openExternalMap = () => {
    const address = 'R. Gralha Azul, 276, São Cristóvão, Guarapuava - PR';
    const { latitude, longitude } = location;
    
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });

    const url = Platform.select({
      ios: `${scheme}${latitude},${longitude}?q=${encodeURIComponent(address)}`,
      android: `${scheme}${latitude},${longitude}?q=${encodeURIComponent(address)}`,
    });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

    Alert.alert(
      'Abrir Navegação',
      'Escolha o aplicativo de navegação',
      [
        {
          text: 'Maps',
          onPress: () => Linking.openURL(url!),
        },
        {
          text: 'Google Maps',
          onPress: () => Linking.openURL(googleMapsUrl),
        },
        {
          text: 'Waze',
          onPress: () => Linking.openURL(wazeUrl),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
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
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={openExternalMap}
            >
              <Ionicons name="navigate" size={24} color="#fff" />
              <Text style={styles.navigateButtonText}>Como Chegar</Text>
            </TouchableOpacity>
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
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  navigateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
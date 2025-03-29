import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';

const LOCATION = {
  latitude: -25.380994,
  longitude: -51.471657,
};

const MapComponent = () => {
  // Usando OpenStreetMap que é open source e não requer API key
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${LOCATION.longitude - 0.002}%2C${LOCATION.latitude - 0.002}%2C${LOCATION.longitude + 0.002}%2C${LOCATION.latitude + 0.002}&layer=mapnik&marker=${LOCATION.latitude}%2C${LOCATION.longitude}`;
  
  return (
    <View style={styles.mapContainer}>
      <WebView
        style={styles.map}
        source={{
          uri: mapUrl
        }}
        scrollEnabled={false}
        onNavigationStateChange={(event) => {
          // Previne que o usuário navegue para fora do mapa
          if (event.url !== mapUrl) {
            return false;
          }
        }}
      />
    </View>
  );
};

export const InfoScreen = () => {
  const [location] = React.useState(LOCATION);

  const handleCopyPix = async () => {
    await Clipboard.setStringAsync('111.339.119-78');
    Alert.alert('Sucesso', 'Chave PIX copiada para a área de transferência!');
  };

  const openExternalMap = () => {
    const address = 'R. Gralha Azul, 276, São Cristóvão, Guarapuava - PR';
    
    if (Platform.OS === 'web') {
      // Abre o OpenStreetMap em uma nova aba
      window.open(`https://www.openstreetmap.org/?mlat=${LOCATION.latitude}&mlon=${LOCATION.longitude}&zoom=17`, '_blank');
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });

    const url = Platform.select({
      ios: `${scheme}${LOCATION.latitude},${LOCATION.longitude}?q=${encodeURIComponent(address)}`,
      android: `${scheme}${LOCATION.latitude},${LOCATION.longitude}?q=${encodeURIComponent(address)}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}> Futsal - Nova Ala </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário e Local</Text>
          <Text style={styles.text}> Jogos toda terça-feira</Text>
          <Text style={styles.text}> Horário: 21h - 22h</Text>
          <Text style={styles.text}> Local: R. Gralha Azul, 276</Text>
          <Text style={styles.text}>São Cristóvão, Guarapuava - PR</Text>
          
          <MapComponent />
          <TouchableOpacity onPress={openExternalMap} style={styles.navigateButton}>
            <Ionicons name="navigate" size={24} color="#fff" />
            <Text style={styles.navigateButtonText}>Como Chegar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vagas Disponíveis</Text>
          <Text style={styles.text}>• 3 Goleiros</Text>
          <Text style={styles.text}>• 12 Jogadores de linha</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <Text style={styles.text}> Mensalidade: R$ 40,00</Text>
          <Text style={styles.subtext}>(pagamento no primeiro jogo do mês)</Text>
          <Text style={styles.text}> Atletas convidados: R$ 15,00 por jogo</Text>
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
  },
  map: {
    flex: 1,
    borderRadius: 12,
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
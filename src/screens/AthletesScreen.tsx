import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase.config';

interface Athlete {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

const USERS_PER_PAGE = 10;

export const AthletesScreen = () => {
  // 1. State hooks first
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Memoized values
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum atleta cadastrado</Text>
    </View>
  ), []);

  // 3. Callbacks
  const loadAthletes = useCallback(async () => {
    try {
      setLoading(true);
      const athletesQuery = query(
        collection(db, 'users'),
        orderBy('fullName', 'asc'),
        limit(USERS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(athletesQuery);
      const athletesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Athlete[];
      
      setAthletes(athletesList);
    } catch (error) {
      console.error('Error loading athletes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os atletas. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAthletes();
  }, [loadAthletes]);

  const renderAthleteItem = useCallback(({ item }: { item: Athlete }) => (
    <View style={styles.athleteCard}>
      <Text style={styles.name}>{item.fullName}</Text>
      <Text style={styles.info}>{item.phone}</Text>
      <Text style={styles.info}>{item.email}</Text>
    </View>
  ), []);

  // 4. Effects
  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={athletes}
        keyExtractor={item => item.id}
        renderItem={renderAthleteItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={USERS_PER_PAGE}
        maxToRenderPerBatch={USERS_PER_PAGE}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  athleteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
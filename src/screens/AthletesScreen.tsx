import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { useFinance } from '../contexts/FinanceContext';

interface Athlete {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

const USERS_PER_PAGE = 10;

export const AthletesScreen = () => {
  const navigation = useNavigation();
  const { getUserBalance } = useFinance();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

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

      // Load balances for each athlete
      const balancesData: Record<string, number> = {};
      await Promise.all(
        athletesList.map(async (athlete) => {
          const balance = await getUserBalance(athlete.id);
          balancesData[athlete.id] = balance;
        })
      );
      setBalances(balancesData);
    } catch (error) {
      console.error('Error loading athletes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os atletas. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getUserBalance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAthletes();
  }, [loadAthletes]);

  const renderAthleteItem = useCallback(({ item }: { item: Athlete }) => {
    const balance = balances[item.id] || 0;
    const status = balance >= 0 ? 'Em dia' : 'Pendente';
    const statusColor = balance >= 0 ? '#4CAF50' : '#F44336';

    return (
      <TouchableOpacity
        style={styles.athleteCard}
        onPress={() => navigation.navigate('PaymentHistory', { userId: item.id })}
      >
        <View style={styles.athleteInfo}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.info}>{item.phone}</Text>
          <Text style={styles.info}>{item.email}</Text>
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
          <Text style={[styles.balance, { color: statusColor }]}>
            R$ {Math.abs(balance).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [balances, navigation]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum atleta cadastrado</Text>
    </View>
  ), []);

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
        contentContainerStyle={styles.listContent}
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
  listContent: {
    padding: 16,
  },
  athleteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  athleteInfo: {
    flex: 1,
  },
  paymentInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 16,
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
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
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
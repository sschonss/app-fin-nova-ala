import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { BalanceCard } from '../components/finance/BalanceCard';
import { PaymentCard } from '../components/finance/PaymentCard';
import { MonthSelector } from '../components/finance/MonthSelector';

export const FinanceScreen = () => {
  const navigation = useNavigation();
  const { transactions, loading } = useFinance();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const filteredTransactions = transactions.filter(t => 
    t.month === `${selectedMonth + 1}`.padStart(2, '0') &&
    t.year === selectedYear
  );

  const monthlyStats = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.income += t.amount;
    } else {
      acc.expenses += t.amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });

  const currentBalance = transactions.reduce(
    (total, t) => total + (t.type === 'income' ? t.amount : -t.amount),
    0
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add refresh logic here if needed
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <BalanceCard
          currentBalance={currentBalance}
          monthlyIncome={monthlyStats.income}
          monthlyExpenses={monthlyStats.expenses}
        />

        <View style={styles.monthSelectorContainer}>
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </View>

        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            filteredTransactions.map(transaction => (
              <PaymentCard
                key={transaction.id}
                id={transaction.id}
                amount={transaction.amount}
                date={transaction.date}
                description={transaction.description}
                status={transaction.status}
                type={transaction.type}
                userId={transaction.userId}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  monthSelectorContainer: {
    margin: 16,
  },
  transactionsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
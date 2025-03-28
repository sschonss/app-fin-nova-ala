import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFinance } from '../contexts/FinanceContext';
import { PaymentCard } from '../components/finance/PaymentCard';
import { MonthSelector } from '../components/finance/MonthSelector';
import { BalanceCard } from '../components/finance/BalanceCard';

export const PaymentHistoryScreen = ({ route }) => {
  const { userId } = route.params;
  const { transactions, loading } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = transactions.filter(t => 
    t.userId === userId &&
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

  const currentBalance = transactions
    .filter(t => t.userId === userId)
    .reduce((total, t) => total + (t.type === 'income' ? t.amount : -t.amount), 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Implement refresh logic here if needed
    setRefreshing(false);
  }, []);

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
        data={filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PaymentCard
            amount={item.amount}
            date={item.date}
            description={item.description}
            status={item.status}
          />
        )}
        ListHeaderComponent={
          <>
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
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
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
  monthSelectorContainer: {
    margin: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BalanceCardProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currentBalance,
  monthlyIncome,
  monthlyExpenses
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.balanceSection}>
        <Text style={styles.label}>Saldo Atual</Text>
        <Text style={[
          styles.balance,
          { color: currentBalance >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          R$ {currentBalance.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Receitas do Mês</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>
            R$ {monthlyIncome.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Despesas do Mês</Text>
          <Text style={[styles.statValue, { color: '#F44336' }]}>
            R$ {monthlyExpenses.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
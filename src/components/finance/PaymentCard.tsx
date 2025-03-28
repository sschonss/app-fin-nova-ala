import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../../contexts/FinanceContext';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentCardProps {
  id: string;
  amount: number;
  date: Date;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
  type: 'income' | 'expense';
  userId: string;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  id,
  amount,
  date,
  description,
  status,
  type,
  userId,
}) => {
  const { deleteTransaction } = useFinance();
  const { user } = useAuth();

  const canDelete = user?.role === 'admin' || user?.id === userId;

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta transação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.leftContent}>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: status === 'completed' ? '#34C759' : '#FF9500' }]} />
            <Text style={styles.statusText}>
              {status === 'completed' ? 'Concluído' : 'Pendente'}
            </Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <Text style={[
            styles.amount,
            { color: type === 'income' ? '#34C759' : '#FF3B30' }
          ]}>
            {type === 'expense' ? '-' : ''}{formatAmount(amount)}
          </Text>
        </View>
      </View>

      {canDelete && (
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  leftContent: {
    flex: 1,
    marginRight: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF1F0',
  },
});
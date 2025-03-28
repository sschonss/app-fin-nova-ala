import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { MonthSelector } from '../components/finance/MonthSelector';

export const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const { addTransaction } = useFinance();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !description) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);

      await addTransaction({
        userId: user!.id,
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(selectedYear, selectedMonth),
        month: `${selectedMonth + 1}`.padStart(2, '0'),
        year: selectedYear,
        category: type === 'income' ? 'mensalidade' : 'despesa',
        status: 'completed',
      });

      Alert.alert('Sucesso', 'Transação registrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Erro', 'Não foi possível registrar a transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.selectedType,
            ]}
            onPress={() => setType('income')}
          >
            <Text style={[
              styles.typeText,
              type === 'income' && styles.selectedTypeText,
            ]}>
              Entrada
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.selectedType,
            ]}
            onPress={() => setType('expense')}
          >
            <Text style={[
              styles.typeText,
              type === 'expense' && styles.selectedTypeText,
            ]}>
              Saída
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva a transação"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mês de Referência</Text>
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Registrando...' : 'Registrar Transação'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  typeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    margin: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
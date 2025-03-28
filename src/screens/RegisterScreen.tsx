import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigation = useNavigation();

  const validateInputs = () => {
    if (!email.trim() || !password.trim() || !fullName.trim() || !phone.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (fullName.trim().length < 3) {
      Alert.alert('Erro', 'O nome deve ter pelo menos 3 caracteres');
      return false;
    }

    if (phone.trim().length < 8) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone válido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      await signUp(
        email.trim().toLowerCase(),
        password,
        fullName.trim(),
        phone.trim()
      );
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Não foi possível criar a conta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Criar Conta</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
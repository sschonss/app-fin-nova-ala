import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { InfoScreen } from './src/screens/InfoScreen';
import { AthletesScreen } from './src/screens/AthletesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Info') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'Athletes') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="Athletes" 
        component={AthletesScreen} 
        options={{ title: 'Atletas' }}
      />
      <Tab.Screen 
        name="Info" 
        component={InfoScreen} 
        options={{ title: 'Informações' }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              headerShown: true,
              headerTitle: 'Criar Conta',
              headerStyle: {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </NavigationContainer>
  );
}
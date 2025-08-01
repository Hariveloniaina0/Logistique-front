// src/navigation/MainNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ImportScreen } from '../screens/main/ImportScreen'; // New screen
import { colors } from '../constants/colors';

export type MainStackParamList = {
  Home: undefined;
  Etiquette: undefined;
  Commande: undefined;
  Demarque: undefined;
  Produit: undefined;
  Inventaire: undefined;
  Reception: undefined;
  Import: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Accueil',
        }}
      />
      <Stack.Screen 
        name="Import" 
        component={ImportScreen}
        options={{
          title: 'Importer des données',
        }}
      />
      {/* Placeholder screens - implement these as needed */}
      <Stack.Screen 
        name="Etiquette" 
        component={PlaceholderScreen}
        options={{ title: 'Étiquettes' }}
      />
      <Stack.Screen 
        name="Commande" 
        component={PlaceholderScreen}
        options={{ title: 'Commandes' }}
      />
      <Stack.Screen 
        name="Demarque" 
        component={PlaceholderScreen}
        options={{ title: 'Démarques' }}
      />
      <Stack.Screen 
        name="Produit" 
        component={PlaceholderScreen}
        options={{ title: 'Produits' }}
      />
      <Stack.Screen 
        name="Inventaire" 
        component={PlaceholderScreen}
        options={{ title: 'Inventaire' }}
      />
      <Stack.Screen 
        name="Reception" 
        component={PlaceholderScreen}
        options={{ title: 'Réception' }}
      />
    </Stack.Navigator>
  );
};

// Temporary placeholder component for unimplemented screens
const PlaceholderScreen: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg" style={{ color: colors.text }}>
        Écran en cours de développement
      </Text>
    </View>
  );
};
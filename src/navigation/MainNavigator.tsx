import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ImportScreen } from '../screens/main/ImportScreen';
import { ProductScreen } from '../screens/main/ProductScreen';
import { FtpSettingsScreen } from '../screens/main/FtpSettingsScreen';
import { colors } from '../constants/colors';
import { View, Text } from 'react-native';

export type MainStackParamList = {
  Home: undefined;
  Etiquette: undefined;
  Commande: undefined;
  Demarque: undefined;
  Produit: undefined;
  Inventaire: undefined;
  Reception: undefined;
  Import: undefined;
  Settings: undefined;
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
      <Stack.Screen 
        name="Produit" 
        component={ProductScreen}
        options={{
          title: 'Produits',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={FtpSettingsScreen}
        options={{
          title: 'Paramètres FTP',
        }}
      />
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

const PlaceholderScreen: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg" style={{ color: colors.text }}>
        Écran en cours de développement
      </Text>
    </View>
  );
};
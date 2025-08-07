import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ImportScreen } from '../screens/main/ImportScreen';
import { ProductScreen } from '../screens/main/ProductScreen';
import { ProductDetailsScreen } from '../screens/main/ProductDetailsScreen';
import { colors } from '../constants/colors';
import { View, Text } from 'react-native';
import OrderScreen from '../screens/main/OrderScreen';
import { FtpSettingsScreen } from '../screens/main/FtpSettingsScreen';
import { StoreListScreen } from '../screens/main/StoreListScreen';
import { SupplierListScreen } from '../screens/main/SupplierListScreen';
import { WarehouseListScreen } from '../screens/main/WarehouseListScreen';
import { WorkZoneScreen } from '../screens/main/WorkZoneScreen';
import { StockScreen } from '../screens/main/StockScreen';

export type MainStackParamList = {
  Home: undefined;
  Etiquette: undefined;
  Commande: undefined;
  Demarque: undefined;
  Produit: undefined;
  ProductDetails: { productId: number };
  Inventaire: undefined;
  Reception: undefined;
  Import: undefined;
  Settings: undefined;
  WorkZone: undefined;
  SupplierList: undefined;
  WarehouseList: undefined;
  StoreList: undefined;
  Stock: undefined;
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
        options={{ title: 'Accueil' }}
      />
      <Stack.Screen
        name="Import"
        component={ImportScreen}
        options={{ title: 'Importer des données' }}
      />
      <Stack.Screen
        name="Produit"
        component={ProductScreen}
        options={{ title: 'Produits' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Détails du Produit' }}
      />
      <Stack.Screen
        name="Etiquette"
        component={PlaceholderScreen}
        options={{ title: 'Étiquettes' }}
      />
      <Stack.Screen
        name="Commande"
        component={OrderScreen}
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
      <Stack.Screen
        name="Settings"
        component={FtpSettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen name="WorkZone" component={WorkZoneScreen} options={{ title: 'Zone de travail' }} />
      <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: 'Fournisseurs' }} />
      <Stack.Screen name="WarehouseList" component={WarehouseListScreen} options={{ title: 'Entrepôts' }} />
      <Stack.Screen name="StoreList" component={StoreListScreen} options={{ title: 'Magasins' }} />
      <Stack.Screen name="Stock" component={StockScreen} options={{ title: 'Stock' }} />
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
// src/screens/main/HomeScreen.tsx
import React from 'react';
import { View, Text, Alert, FlatList } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { UserRole } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.EMPLOYEE:
        return 'Employé';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return colors.error;
      case UserRole.MANAGER:
        return colors.accent;
      case UserRole.EMPLOYEE:
        return colors.primary;
      default:
        return colors.neutral;
    }
  };

  const menuItems = [
    { title: 'Étiquettes', screen: 'Etiquette' as keyof MainStackParamList, variant: 'primary' },
    { title: 'Commandes', screen: 'Commande' as keyof MainStackParamList, variant: 'secondary' },
    { title: 'Démarques', screen: 'Demarque' as keyof MainStackParamList, variant: 'outline' },
    { title: 'Produits', screen: 'Produit' as keyof MainStackParamList, variant: 'primary' },
    { title: 'Inventaire', screen: 'Inventaire' as keyof MainStackParamList, variant: 'secondary' },
    { title: 'Réception', screen: 'Reception' as keyof MainStackParamList, variant: 'outline' },
  ];

  const renderMenuItem = ({ item }: { item: { title: string; screen: keyof MainStackParamList; variant: 'primary' | 'secondary' | 'outline' } }) => (
    <View className="w-1/2 p-2">
      <Button
        title={item.title}
        variant={item.variant}
        onPress={() => navigation.navigate(item.screen)}
      />
    </View>
  );

  return (
    <Layout>
      <View className="flex-1 justify-between px-6 py-4">
        {/* Welcome Section */}
        <View className="items-center mb-8">
          <View 
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-2xl font-bold" style={{ color: colors.white }}>
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Bonjour, {user?.userName}! 👋
          </Text>
          
          <Text className="text-base text-center mb-4" style={{ color: colors.textLight }}>
            Bienvenue dans votre espace Store Manager
          </Text>

          {/* User Info Card */}
          <View 
            className="bg-white rounded-lg p-4 w-full max-w-sm shadow-sm border"
            style={{ borderColor: colors.neutral }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm" style={{ color: colors.textMuted }}>
                Email:
              </Text>
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {user?.emailAddress}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm" style={{ color: colors.textMuted }}>
                Rôle:
              </Text>
              <View 
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${getRoleColor(user?.userRole)}20` }}
              >
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: getRoleColor(user?.userRole) }}
                >
                  {getRoleDisplayName(user?.userRole)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm" style={{ color: colors.textMuted }}>
                Statut:
              </Text>
              <View 
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: colors.success }}
                >
                  Actif
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Grid */}
        <View className="flex-1">
          <Text className="text-lg font-semibold mb-4 text-center" style={{ color: colors.text }}>
            Actions rapides
          </Text>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.screen}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
        </View>

        {/* Import Button */}
        <View className="mt-4">
          <Button
            title="Importer des nouvelles données"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('Import')}
          />
        </View>

        {/* Logout Button */}
        <View className="mt-4">
          <Button
            title="Déconnexion"
            variant="danger"
            onPress={handleLogout}
          />
        </View>
      </View>
    </Layout>
  );
};
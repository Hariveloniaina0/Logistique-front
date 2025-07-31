import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { UserRole } from '../../types';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

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

  return (
    <Layout>
      <View className="flex-1 justify-center items-center">
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

        {/* Actions Section */}
        <View className="w-full max-w-sm">
          <Text className="text-lg font-semibold mb-4 text-center" style={{ color: colors.text }}>
            Actions rapides
          </Text>
          
          <View className="space-y-3">
            <Button
              title="Voir le profil"
              variant="primary"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            
            <Button
              title="Paramètres"
              variant="outline"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            
            <Button
              title="Déconnexion"
              variant="danger"
              onPress={handleLogout}
            />
          </View>
        </View>
      </View>
    </Layout>
  );
};
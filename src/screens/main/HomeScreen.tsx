import React, { useState } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { UserRole } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { Menu, X } from 'react-native-feather';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-Dimensions.get('window').width * 0.75))[0];

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

  const menuItems: Array<{
    title: string;
    screen: keyof MainStackParamList;
    variant: 'primary' | 'secondary' | 'outline';
    icon: string;
  }> = [
      { title: 'Étiquettes', screen: 'Etiquette', variant: 'primary', icon: '🏷️' },
      { title: 'Commandes', screen: 'Commande', variant: 'secondary', icon: '📦' },
      { title: 'Démarques', screen: 'Demarque', variant: 'outline', icon: '💸' },
      { title: 'Produits', screen: 'Produit', variant: 'primary', icon: '🛍️' },
      { title: 'Inventaire', screen: 'Inventaire', variant: 'secondary', icon: '📋' },
      { title: 'Réception', screen: 'Reception', variant: 'outline', icon: '🚚' },
    ];

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? -Dimensions.get('window').width * 0.75 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const renderMenuItem = ({ item }: { item: { title: string; screen: keyof MainStackParamList; variant: 'primary' | 'secondary' | 'outline'; icon: string } }) => (
    <View className="w-1/2 p-2">
      <Button
        title={item.title}
        variant={item.variant}
        size="medium"
        onPress={() => {
          navigation.navigate(item.screen);
          toggleMenu();
        }}
        style={{
          shadowColor: colors.textMuted,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="mr-2 text-lg">{item.icon}</Text>
      </Button>
    </View>
  );

  return (
    <Layout safeArea={true}>
      <View className="flex-1">
        {/* Header with Burger Menu Button */}
        <View className="flex-row justify-between items-center p-4 bg-white border-b" style={{ borderColor: colors.neutral }}>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Store Manager
          </Text>
          <TouchableOpacity onPress={toggleMenu}>
            <Menu width={24} height={24} stroke={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-between px-6 py-4">
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
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>

          {/* Import Button */}
          <View className="mt-4">
            <Button
              title="Importer des nouvelles données"
              variant="primary"
              size="large"
              onPress={() => navigation.navigate('Import')}
              style={{
                shadowColor: colors.textMuted,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className="mr-2 text-lg">📤</Text>
            </Button>
          </View>
        </View>

        {/* Slide-out Menu */}
        <Animated.View
          className="absolute top-0 bottom-0 w-3/4 bg-white shadow-lg"
          style={{
            transform: [{ translateX: slideAnim }],
            borderRightWidth: 1,
            borderRightColor: colors.neutral,
          }}
        >
          <View className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Profil
              </Text>
              <TouchableOpacity onPress={toggleMenu}>
                <X width={24} height={24} stroke={colors.primary} />
              </TouchableOpacity>
            </View>

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
                    style={{ backgroundColor: `${user?.userRole ? getRoleColor(user.userRole) : colors.neutral}20` }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: user?.userRole ? getRoleColor(user.userRole) : colors.neutral }}
                    >
                      {user?.userRole ? getRoleDisplayName(user.userRole) : 'Inconnu'}
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

            {/* Logout Button */}
            <Button
              title="Déconnexion"
              variant="danger"
              onPress={handleLogout}
              style={{ marginTop: 16 }}
            />
          </View>
        </Animated.View>

        {/* Overlay when menu is open */}
        {isMenuOpen && (
          <TouchableOpacity
            className="absolute top-0 bottom-0 left-0 right-0"
            style={{ backgroundColor: colors.overlay }}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        )}
      </View>
    </Layout>
  );
};
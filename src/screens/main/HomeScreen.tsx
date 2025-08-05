import React, { useState, useEffect } from 'react';
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


  const toggleMenu = () => {
    const toValue = isMenuOpen ? -Dimensions.get('window').width * 0.75 : 0;

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Configuration du header avec le burger menu
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={toggleMenu}
          className="p-2 rounded-lg mr-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Menu width={24} height={24} stroke={colors.white} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleMenu}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Text className="text-white font-bold text-sm">
            {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, user, toggleMenu]);

  // Fermer le menu lors du changement de navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      closeMenu();
    });

    return unsubscribe;
  }, [navigation]);

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



  const closeMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsMenuOpen(false);
    }
  };

  const renderMenuItem = ({ item }: {
    item: {
      title: string;
      screen: keyof MainStackParamList;
      variant: 'primary' | 'secondary' | 'outline';
      icon: string
    }
  }) => (
    <View className="w-1/2 p-2">
      <Button
        title={item.title}
        variant={item.variant}
        size="medium"
        onPress={() => {
          closeMenu(); // Fermer le menu d'abord
          setTimeout(() => {
            navigation.navigate(item.screen);
          }, 50); // Petit délai pour éviter les conflits
        }}
        style={{
          shadowColor: colors.textMuted,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
          minHeight: 60,
        }}
      >
        <Text className="mr-2 text-lg">{item.icon}</Text>
      </Button>
    </View>
  );

  return (
    <Layout safeArea={false} padding={false}>
      <View className="flex-1">

        {/* Message de bienvenue plus compact */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
            Bonjour, {user?.userName}! 👋
          </Text>
          <Text className="text-sm" style={{ color: colors.textLight }}>
            Que souhaitez-vous faire aujourd'hui ?
          </Text>
        </View>

        {/* Main Content avec meilleur espacement */}
        <View className="flex-1 px-6 py-4" style={{ backgroundColor: colors.background }}>
          <View className="flex-1">
            <Text className="text-base font-medium mb-4" style={{ color: colors.text }}>
              Actions rapides
            </Text>
            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.screen}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Import Button avec design amélioré */}
          <View className="mt-4">
            <Button
              title="Importer de nouvelles données"
              variant="primary"
              size="large"
              onPress={() => {
                closeMenu();
                setTimeout(() => {
                  navigation.navigate('Import');
                }, 50);
              }}
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
                borderRadius: 12,
              }}
            >
              <Text className="mr-2 text-lg">📤</Text>
            </Button>
          </View>
        </View>

        {/* Slide-out Menu amélioré */}
        {isMenuOpen && (
          <Animated.View
            className="absolute top-0 bottom-0 w-3/4 bg-white z-50"
            style={{
              left: 0,
              transform: [{ translateX: slideAnim }],
              shadowColor: colors.textMuted,
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <View className="flex-1">
              {/* Header du menu */}
              <View
                className="flex-row justify-between items-center px-4 py-3 border-b"
                style={{
                  borderColor: colors.neutral,
                  backgroundColor: colors.primary,
                }}
              >
                <Text className="text-xl font-bold text-white">
                  Profil
                </Text>
                <TouchableOpacity
                  onPress={closeMenu}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <X width={24} height={24} stroke={colors.white} />
                </TouchableOpacity>
              </View>

              <View className="flex-1 p-4">
                {/* Section utilisateur */}
                <View className="items-center mb-6">
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-2xl font-bold text-white">
                      {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>

                  <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                    {user?.userName}
                  </Text>

                  <Text className="text-sm text-center mb-4" style={{ color: colors.textLight }}>
                    {user?.emailAddress}
                  </Text>

                  {/* Carte d'informations utilisateur améliorée */}
                  <View
                    className="bg-white rounded-xl p-4 w-full shadow-sm border"
                    style={{
                      borderColor: colors.neutral,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                        Rôle
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full"
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
                      <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                        Statut
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${colors.success}20` }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.success }}
                        >
                          🟢 Actif
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions du menu */}
                <View className="mb-6">
                  <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                    Actions rapides
                  </Text>

                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-lg mb-2"
                    style={{ backgroundColor: `${colors.primary}10` }}
                    onPress={() => {
                      closeMenu();
                      setTimeout(() => {
                        navigation.navigate('Import');
                      }, 50);
                    }}
                  >
                    <Text className="mr-3 text-lg">⚙️</Text>
                    <Text className="text-base" style={{ color: colors.text }}>
                      Paramètres
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-lg mb-2"
                    style={{ backgroundColor: `${colors.info}10` }}
                    onPress={() => {
                      Alert.alert('À propos', 'Store Manager v1.0.0');
                    }}
                  >
                    <Text className="mr-3 text-lg">ℹ️</Text>
                    <Text className="text-base" style={{ color: colors.text }}>
                      À propos
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton de déconnexion */}
                <View className="mt-auto">
                  <Button
                    title="Déconnexion"
                    variant="danger"
                    onPress={() => {
                      closeMenu();
                      setTimeout(() => {
                        handleLogout();
                      }, 300);
                    }}
                    style={{
                      borderRadius: 12,
                      shadowColor: colors.error,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Overlay amélioré */}
        {isMenuOpen && (
          <TouchableOpacity
            className="absolute top-0 bottom-0 left-0 right-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onPress={closeMenu}
            activeOpacity={1}
          />
        )}
      </View>
    </Layout>
  );
};
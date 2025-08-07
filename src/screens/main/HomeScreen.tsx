import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
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
  }, [navigation, user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isMenuOpen) {
        Animated.timing(slideAnim, {
          toValue: -Dimensions.get('window').width * 0.75,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setIsMenuOpen(false));
      }
    });
    return unsubscribe;
  }, [navigation, isMenuOpen]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
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
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.MANAGER: return 'Manager';
      case UserRole.EMPLOYEE: return 'Employé';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return colors.error;
      case UserRole.MANAGER: return colors.accent;
      case UserRole.EMPLOYEE: return colors.primary;
      default: return colors.neutral;
    }
  };

  const menuItems = [
    { title: 'Étiquettes', screen: 'Etiquette', variant: 'primary', icon: '🏷️', bgColor: colors.primaryLight },
    { title: 'Commandes', screen: 'Commande', variant: 'secondary', icon: '📦', bgColor: colors.secondary },
    { title: 'Démarques', screen: 'Demarque', variant: 'outline', icon: '💸', bgColor: colors.white },
    { title: 'Produits', screen: 'Produit', variant: 'primary', icon: '🛍️', bgColor: colors.primaryLight },
    { title: 'Inventaire', screen: 'Inventaire', variant: 'secondary', icon: '📋', bgColor: colors.secondary },
    { title: 'Réception', screen: 'Reception', variant: 'outline', icon: '🚚', bgColor: colors.white },
  ];

  const closeMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    }
  };

  const renderMenuItem = ({ item }: any) => (
    <View className="w-1/2 p-2">
      <TouchableOpacity
        className="rounded-xl p-4 items-center justify-center h-28"
        style={{
          backgroundColor: item.bgColor,
          borderWidth: item.variant === 'outline' ? 2 : 0,
          borderColor: colors.primary,
          shadowColor: colors.textMuted,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }}
        onPress={() => {
          closeMenu();
          setTimeout(() => navigation.navigate(item.screen), 50);
        }}
      >
        <Text className="text-2xl mb-2">{item.icon}</Text>
        <Text
          className="text-base font-semibold text-center"
          style={{
            color: item.variant === 'outline' ? colors.primary : colors.white
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Layout safeArea={true} padding={false}>
      <View className="flex-1 bg-white">
        {/* Header avec dégradé */}
        <View
          className="px-6 pt-10 pb-6"
          style={{
            backgroundColor: colors.primary,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: colors.textMuted,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: colors.white }}
          >
            Bonjour, {user?.userName}!
          </Text>
          <Text
            className="text-base opacity-90"
            style={{ color: colors.white }}
          >
            Que souhaitez-vous faire aujourd'hui ?
          </Text>
        </View>

        {/* Contenu principal */}
        <View className="flex-1 px-5 py-6" style={{ backgroundColor: colors.background }}>
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
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

          {/* Bouton d'import */}
          <View className="mt-4">
            <Button
              title="Importer de nouvelles données"
              variant="primary"
              size="large"
              onPress={() => {
                closeMenu();
                setTimeout(() => navigation.navigate('Import'), 50);
              }}
              style={{
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text className="mr-2 text-lg">📤</Text>
            </Button>
          </View>
        </View>

        {/* Menu latéral */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: Dimensions.get('window').width * 0.75,
            zIndex: 50,
            transform: [{ translateX: slideAnim }],
            shadowColor: colors.text,
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 20,
          }}
        >
          <SafeAreaView className="flex-1 bg-white">
            {/* En-tête du menu */}
            <View
              className="flex-row justify-between items-center px-5 py-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xl font-bold text-white">
                Profil
              </Text>
              <TouchableOpacity
                onPress={closeMenu}
                className="p-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <X width={24} height={24} stroke={colors.white} />
              </TouchableOpacity>
            </View>

            <View className="flex-1 p-5">
              {/* Section utilisateur */}
              <View className="items-center mb-8">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: colors.primaryLight,
                    borderWidth: 3,
                    borderColor: colors.white,
                    shadowColor: colors.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text className="text-3xl font-bold text-white">
                    {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>

                <Text
                  className="text-xl font-bold mb-1 text-center"
                  style={{ color: colors.text }}
                >
                  {user?.userName}
                </Text>

                <Text
                  className="text-sm text-center mb-5"
                  style={{ color: colors.textLight }}
                >
                  {user?.emailAddress}
                </Text>

                {/* Badges d'information */}
                <View className="flex-row justify-center space-x-3 mb-6">
                  <View
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: `${getRoleColor(user?.userRole || UserRole.EMPLOYEE)}20` }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getRoleColor(user?.userRole || UserRole.EMPLOYEE) }}
                    >
                      {user?.userRole ? getRoleDisplayName(user.userRole) : 'Inconnu'}
                    </Text>
                  </View>

                  <View
                    className="px-4 py-2 rounded-full"
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

              {/* Actions du menu */}
              <View className="mb-8">
                <Text
                  className="text-lg font-bold mb-4 pl-2"
                  style={{ color: colors.text }}
                >
                  Menu
                </Text>

                <TouchableOpacity
                  className={`flex-row items-center p-4 rounded-xl mb-3 ${user?.userRole === UserRole.EMPLOYEE ? 'opacity-50' : ''
                    }`}
                  style={{ backgroundColor: colors.background }}
                  onPress={() => {
                    if (user?.userRole === UserRole.ADMIN || user?.userRole === UserRole.MANAGER) {
                      closeMenu();
                      setTimeout(() => navigation.navigate('Settings'), 50);
                    } else {
                      Alert.alert('Accès refusé', 'Cette fonctionnalité est réservée aux administrateurs et managers.');
                    }
                  }}
                  disabled={user?.userRole === UserRole.EMPLOYEE}
                >
                  <View
                    className="w-10 h-10 rounded-lg mr-3 items-center justify-center"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <Text className="text-lg">⚙️</Text>
                  </View>
                  <Text className="text-base" style={{ color: colors.text }}>
                    Paramètres FTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 rounded-xl mb-3"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => {
                    closeMenu();
                    setTimeout(() => navigation.navigate('WorkZone'), 50);
                  }}
                >
                  <View className="w-10 h-10 rounded-lg mr-3 items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                    <Text className="text-lg">🏢</Text>
                  </View>
                  <Text className="text-base" style={{ color: colors.text }}>
                    Zone de travail
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 rounded-xl"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => Alert.alert('À propos', 'Store Manager v1.0.0')}
                >
                  <View
                    className="w-10 h-10 rounded-lg mr-3 items-center justify-center"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <Text className="text-lg">ℹ️</Text>
                  </View>
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
                  size="medium"
                  onPress={() => {
                    closeMenu();
                    setTimeout(handleLogout, 300);
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
          </SafeAreaView>
        </Animated.View>

        {/* Overlay */}
        {isMenuOpen && (
          <TouchableOpacity
            className="absolute top-0 bottom-0 left-0 right-0 z-40 bg-black/30"
            onPress={closeMenu}
            activeOpacity={1}
          />
        )}
      </View>
    </Layout>
  );
};
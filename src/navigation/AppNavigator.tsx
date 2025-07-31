// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useGlobalContext } from '../context/GlobalContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useGlobalContext();

  // Afficher un écran de chargement pendant l'initialisation
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
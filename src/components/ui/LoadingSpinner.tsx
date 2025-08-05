// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../../constants/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Chargement...',
  size = 'large',
  color = colors.primary,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-2 text-center" style={{ color: colors.textLight }}>
          {message}
        </Text>
      )}
    </View>
  );
};
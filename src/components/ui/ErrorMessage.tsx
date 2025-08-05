// src/components/ui/ErrorMessage.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Réessayer',
}) => {
  return (
    <View className="p-4 rounded-lg mb-4" style={{ backgroundColor: `${colors.error}10` }}>
      <Text className="text-sm" style={{ color: colors.error }}>
        ❌ {message}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          className="mt-2 px-3 py-2 rounded" 
          style={{ backgroundColor: colors.error }}
          onPress={onRetry}
        >
          <Text className="text-sm font-medium text-center" style={{ color: colors.white }}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
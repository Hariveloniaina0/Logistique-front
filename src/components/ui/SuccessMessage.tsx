// src/components/ui/SuccessMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../constants/colors';

interface SuccessMessageProps {
  message: string;
  details?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  details,
}) => {
  return (
    <View className="p-4 rounded-lg mb-4" style={{ backgroundColor: `${colors.success}10` }}>
      <Text className="font-medium" style={{ color: colors.success }}>
        ✅ {message}
      </Text>
      {details && (
        <Text className="text-sm mt-1" style={{ color: colors.success }}>
          {details}
        </Text>
      )}
    </View>
  );
};
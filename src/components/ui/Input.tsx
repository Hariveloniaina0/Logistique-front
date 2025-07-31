import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  isPassword?: boolean;
  containerStyle?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = touched && error;

  const getInputStyle = () => {
    const baseStyle = 'border rounded-lg px-4 py-3 text-base';
    const borderColor = hasError 
      ? `border-[${colors.error}]` 
      : isFocused 
        ? `border-[${colors.primary}]` 
        : `border-[${colors.neutral}]`;
    
    return `${baseStyle} ${borderColor} bg-[${colors.white}]`;
  };

  return (
    <View className={`mb-4 ${containerStyle || ''}`}>
      {label && (
        <Text className={`text-base font-medium mb-2 text-[${colors.text}]`}>
          {label}
        </Text>
      )}
      
      <View className="relative">
        <TextInput
          className={getInputStyle()}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textMuted}
          style={style}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text className={`text-[${colors.primary}]`}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {hasError && (
        <Text className={`text-sm mt-1 text-[${colors.error}]`}>
          {error}
        </Text>
      )}
    </View>
  );
};

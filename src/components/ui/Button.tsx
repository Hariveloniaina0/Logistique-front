// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'rounded-lg flex-row items-center justify-center';
    
    // Size styles
    const sizeStyles = {
      small: 'px-4 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4',
    };

    // Variant styles
    const variantStyles = {
      primary: `bg-[${colors.primary}]`,
      secondary: `bg-[${colors.secondary}]`,
      outline: `border-2 border-[${colors.primary}] bg-transparent`,
      danger: `bg-[${colors.error}]`,
      success: `bg-[${colors.success}]`, 
    };

    return `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${
      disabled ? 'opacity-50' : ''
    }`;
  };

  const getTextStyle = () => {
    const baseStyle = 'font-semibold text-center';
    
    const sizeStyles = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    const variantStyles = {
      primary: `text-[${colors.white}]`,
      secondary: `text-[${colors.white}]`,
      outline: `text-[${colors.primary}]`,
      danger: `text-[${colors.white}]`,
      success: `text-[${colors.white}]`, 
    };

    return `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.primary : colors.white} 
        />
      ) : (
        <Text className={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
// src/components/common/Layout.tsx
import React, { ReactNode } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../constants/colors';

interface LayoutProps {
  children: ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  padding?: boolean;
  safeArea?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  backgroundColor = colors.background,
  statusBarStyle = 'dark-content',
  padding = true,
  safeArea = true,
}) => {
  const Container = safeArea ? SafeAreaView : View;
  
  return (
    <Container className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <View className={`flex-1 ${padding ? 'px-4' : ''}`}>
        {children}
      </View>
    </Container>
  );
};
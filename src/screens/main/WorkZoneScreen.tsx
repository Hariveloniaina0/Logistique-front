// src/screens/main/WorkZoneScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const WorkZoneScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Layout>
      <View className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
          Zone de travail
        </Text>

        <TouchableOpacity
          className="p-4 mb-3 rounded-xl"
          style={{ backgroundColor: colors.primaryLight }}
          onPress={() => navigation.navigate('SupplierList')}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.white }}>
            Fournisseurs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 mb-3 rounded-xl"
          style={{ backgroundColor: colors.secondary }}
          onPress={() => navigation.navigate('WarehouseList')}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.white }}>
            Entrepôts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 mb-3 rounded-xl"
          style={{ backgroundColor: colors.accent }}
          onPress={() => navigation.navigate('StoreList')}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.white }}>
            Magasins
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};
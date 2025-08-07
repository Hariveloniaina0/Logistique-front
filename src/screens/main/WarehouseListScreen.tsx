// src/screens/main/WarehouseListScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useWarehouses } from '../../hooks/useWarehouses';

export const WarehouseListScreen: React.FC = () => {
  const { warehouses, isLoading, error, loadWarehouses } = useWarehouses();

  useEffect(() => {
    loadWarehouses();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-center mt-4" style={{ color: colors.text }}>
            Chargement...
          </Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Text className="text-center mt-4 text-red-500">{error}</Text>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Liste des entrepôts
        </Text>
        <FlatList
          data={warehouses}
          keyExtractor={(item) => item.idWarehouse.toString()}
          renderItem={({ item }) => (
            <View className="p-4 mb-2 bg-white rounded-lg">
              <Text className="text-lg" style={{ color: colors.text }}>
                {item.warehouseName}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-4">
              Aucun entrepôt trouvé
            </Text>
          }
        />
      </View>
    </Layout>
  );
};
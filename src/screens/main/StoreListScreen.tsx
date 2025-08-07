// src/screens/main/StoreListScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useStores } from '../../hooks/useStores';

export const StoreListScreen: React.FC = () => {
  const { stores, isLoading, error, loadStores } = useStores();

  useEffect(() => {
    loadStores();
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
          Liste des magasins
        </Text>
        <FlatList
          data={stores}
          keyExtractor={(item) => item.idStore.toString()}
          renderItem={({ item }) => (
            <View className="p-4 mb-2 bg-white rounded-lg">
              <Text className="text-lg" style={{ color: colors.text }}>
                {item.storeName}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-4">
              Aucun magasin trouvé
            </Text>
          }
        />
      </View>
    </Layout>
  );
};
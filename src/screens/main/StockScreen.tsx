import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useStock } from '../../hooks/useStock';
import { Stock } from '../../types/stock.types';

export const StockScreen: React.FC = () => {
  const { stocks, loading, error, loadStocks, clearStockError } = useStock();

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK', onPress: clearStockError }]);
    }
  }, [error]);

  const renderStockItem = ({ item }: { item: Stock }) => (
    <View className="bg-white p-4 rounded-lg mb-2 border" style={{ borderColor: colors.neutral }}>
      <Text className="font-semibold" style={{ color: colors.text }}>
        {item.product.productName}
      </Text>
      <Text style={{ color: colors.textLight }}>
        Code: {item.product.productCode}
      </Text>
      <Text style={{ color: colors.textLight }}>
        Quantité: {item.quantity}
      </Text>
      <Text style={{ color: colors.textLight }}>
        Localisation: {item.store?.storeName || item.warehouse?.warehouseName || 'Non spécifiée'}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
        Modifié: {new Date(item.changeDate).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <Layout>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
          📦 Gestion des Stocks
        </Text>

        {loading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textLight }}>Chargement...</Text>
          </View>
        )}

        {!loading && stocks.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
            Aucun stock trouvé.
          </Text>
        )}

        {!loading && stocks.length > 0 && (
          <FlatList
            data={stocks}
            renderItem={renderStockItem}
            keyExtractor={(item) => item.idStock.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </Layout>
  );
};
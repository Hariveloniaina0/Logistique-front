import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { apiService } from '../../services/api';
import { Product } from '../../types/product.types';

interface ProductScreenProps {
    route?: { params?: { productId?: number } };
}

export const ProductScreen: React.FC<ProductScreenProps> = ({ route }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.get<Product[]>('/products');
                setProducts(response);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des produits';
                setError(errorMessage);
                Alert.alert('Erreur', errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const renderProductItem = ({ item }: { item: Product }) => {
        const totalStock = item.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0;
        return (
            <View className="bg-white p-4 rounded-lg mb-2 border" style={{ borderColor: colors.neutral }}>
                <Text className="font-semibold" style={{ color: colors.text }}>
                    {item.productName}
                </Text>
                <Text style={{ color: colors.textLight }}>
                    Code: {item.productCode}
                </Text>
                <Text style={{ color: colors.textLight }}>
                    Code-barres: {item.barcodeValue}
                </Text>
                <Text style={{ color: colors.textLight }}>
                    Stock total: {totalStock}
                </Text>

                <Text style={{ color: colors.textLight }}>
                    Prix Caisse: {typeof item.priceCaisse === 'number' ? item.priceCaisse.toFixed(2) : 'N/A'} €
                </Text>
                <Text style={{ color: colors.textLight }}>
                    Prix Gestcom: {typeof item.priceGestcom === 'number' ? item.priceGestcom.toFixed(2) : 'N/A'} €
                </Text>
            </View>
        );
    };

    return (
        <Layout>
            <View className="flex-1 p-4">
                <Text className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                    📦 Liste des Produits
                </Text>

                {loading && (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ color: colors.textLight }}>Chargement...</Text>
                    </View>
                )}

                {!loading && products.length === 0 && (
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                        Aucun produit trouvé.
                    </Text>
                )}

                {!loading && products.length > 0 && (
                    <FlatList
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.idProduct.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </Layout>
    );
};
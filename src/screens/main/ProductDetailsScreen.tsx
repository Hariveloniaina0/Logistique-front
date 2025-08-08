import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getProductById, getPendingOrdersForProduct } from '../../store/slices/productSlice';
import { MainStackParamList } from '../../navigation/MainNavigator';

const { height } = Dimensions.get('window');

type ProductDetailsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ProductDetails'>;

interface ProductDetailsScreenProps { }

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<ProductDetailsNavigationProp>();
    const route = useRoute();
    const { productId } = route.params as { productId: number };
    const { selectedProduct, isLoading, error } = useSelector((state: RootState) => state.products);

    const { pendingOrders, isLoading: isLoadingOrders } = useSelector(
        (state: RootState) => state.products
    );

    useEffect(() => {
        if (productId) {
            dispatch(getPendingOrdersForProduct(productId));
        }
    }, [dispatch, productId]);

    // Calculez la quantité totale des commandes en cours
    const totalPendingOrders = pendingOrders?.reduce(
        (sum, order) => sum + order.ordersQuantity,
        0
    ) || 0;


    useEffect(() => {
        dispatch(getProductById(productId));
    }, [dispatch, productId]);

    if (isLoading) {
        return (
            <Layout>
                <View className="flex-1 justify-center items-center bg-gray-50">
                    <View className="bg-white p-6 rounded-xl shadow-lg items-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text className="mt-3 text-gray-600 font-medium">
                            Chargement...
                        </Text>
                    </View>
                </View>
            </Layout>
        );
    }

    if (error || !selectedProduct) {
        return (
            <Layout>
                <View className="flex-1 justify-center items-center bg-gray-50 px-4">
                    <View className="bg-white p-6 rounded-xl shadow-lg items-center max-w-sm">
                        <Text className="text-red-500 text-3xl mb-3">⚠️</Text>
                        <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
                            Produit non trouvé
                        </Text>
                        <Text className="text-sm text-gray-500 text-center mb-4">
                            {error || 'Impossible de charger le produit'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-blue-500 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-medium">Retour</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Layout>
        );
    }

    const totalStock = selectedProduct.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0;
    const priceCaisse = selectedProduct.priceCaisse != null ? parseFloat(String(selectedProduct.priceCaisse)) : null;
    const priceGestcom = selectedProduct.priceGestcom != null ? parseFloat(String(selectedProduct.priceGestcom)) : null;
    const priceDifference = priceCaisse && priceGestcom ? Math.abs(priceCaisse - priceGestcom).toFixed(2) : 'N/A';
    const isCaisseCheaper = priceCaisse && priceGestcom ? priceCaisse < priceGestcom : false;

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { color: 'text-red-600', bg: 'bg-red-50', icon: '❌' };
        if (quantity < 10) return { color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚠️' };
        return { color: 'text-green-600', bg: 'bg-green-50', icon: '✅' };
    };

    const stockStatus = getStockStatus(totalStock);

    const renderCompactStock = () => {
        if (!selectedProduct.stocks || selectedProduct.stocks.length === 0) {
            return <Text className="text-xs text-gray-500">Aucun stock</Text>;
        }

        return (
            <View className="flex-row flex-wrap gap-1">
                {selectedProduct.stocks.slice(0, 3).map((stock, index) => {
                    const location = stock.store?.storeName || stock.warehouse?.warehouseName || 'Inconnu';
                    const shortName = location.length > 8 ? location.substring(0, 8) + '...' : location;
                    return (
                        <View key={index} className="bg-blue-50 px-2 py-1 rounded-md">
                            <Text className="text-xs text-blue-700 font-medium">
                                {shortName}: {stock.quantity}
                            </Text>
                        </View>
                    );
                })}
                {selectedProduct.stocks.length > 3 && (
                    <View className="bg-gray-100 px-2 py-1 rounded-md">
                        <Text className="text-xs text-gray-600">+{selectedProduct.stocks.length - 3}</Text>
                    </View>
                )}
            </View>
        );
    };


    const renderSupplier = () => {
        const suppliers = selectedProduct.stocks
            ?.filter(stock => stock.supplier)
            ?.map(stock => stock.supplier!.supplierName)
            ?.filter((name, index, self) => self.indexOf(name) === index);

        if (!suppliers || suppliers.length === 0) {
            return <Text className="text-sm text-gray-700 mt-2">Aucun fournisseur assigné</Text>;
        }

        return (
            <View>
                {suppliers.map((supplierName, index) => (
                    <Text key={index} className="text-sm text-gray-700 mt-2" numberOfLines={2}>
                        {supplierName}
                    </Text>
                ))}
            </View>
        );
    };

    return (
        <Layout safeArea={true} backgroundColor="#f8fafc">
            <View className="flex-1 px-4 py-3">
                {/* En-tête compact */}
                <View className="bg-white p-4 rounded-xl shadow-sm mb-3">
                    <Text className="text-xl font-bold text-gray-900 mb-2" numberOfLines={2}>
                        {selectedProduct.productName}
                    </Text>
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Code: {selectedProduct.productCode}
                        </Text>
                        <Text className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {selectedProduct.barcodeValue}
                        </Text>
                    </View>
                </View>

                {/* Grille principale */}
                <View className="flex-1 gap-3">
                    {/* Ligne 1: Prix et Stock */}
                    <View className="flex-row gap-3" style={{ flex: 0.4 }}>
                        {/* Comparaison des prix */}
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                            <View className="flex-row items-center mb-2">
                                <Text className="font-semibold text-gray-800 flex-1 text-sm">
                                    Prix 💰
                                </Text>
                                {priceDifference !== 'N/A' && (
                                    <Text className="text-xs text-blue-600 font-medium">
                                        Δ {priceDifference}€
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row justify-between gap-2">
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-500">Caisse</Text>
                                    <Text className={`font-bold text-sm ${isCaisseCheaper ? 'text-green-600' : 'text-gray-800'}`}>
                                        {priceCaisse != null && !isNaN(priceCaisse) ? `${priceCaisse.toFixed(2)}€` : 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-500">Gestcom</Text>
                                    <Text className={`font-bold text-sm ${!isCaisseCheaper && priceCaisse && priceGestcom ? 'text-green-600' : 'text-gray-800'}`}>
                                        {priceGestcom != null && !isNaN(priceGestcom) ? `${priceGestcom.toFixed(2)}€` : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            {/* Stock total */}
                            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                                <View className="flex-row items-center mb-2">
                                    <Text className="font-semibold text-gray-800 flex-1 text-sm">
                                        Stock {stockStatus.icon}
                                    </Text>
                                    <View className={`px-2 py-1 rounded-md ${stockStatus.bg}`}>
                                        <Text className={`text-xs font-bold ${stockStatus.color}`}>
                                            {totalStock}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-xs text-gray-500 mb-1">unités au total</Text>
                            </View>
                        </View>
                    </View>

                    {/* Ligne 2: Détails des stocks */}
                    <View className="bg-white p-4 rounded-xl shadow-sm" style={{ flex: 0.35 }}>
                        <Text className="font-semibold text-gray-800 mb-3 text-sm">
                            📦 Répartition des stocks
                        </Text>
                        {renderCompactStock()}
                    </View>
                    <View className="bg-white p-4 rounded-xl shadow-sm" style={{ flex: 0.25 }}>
                        <View className="flex-row items-center">
                            <Text className="font-semibold text-gray-800 text-sm mr-2">
                                📝 Commandes en cours
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-700 mt-2">
                            Quantité totale: {totalPendingOrders}
                        </Text>
                        {pendingOrders?.length > 0 && (
                            <FlatList
                                data={pendingOrders}
                                keyExtractor={(item) => item.idOrders.toString()}
                                renderItem={({ item }) => (
                                    <View className="mt-1">
                                        <Text className="text-xs text-gray-600">
                                            {item.ordersQuantity} unités - {new Date(item.ordersDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                    {/* Ligne 3: Fournisseur */}
                    <View className="bg-white p-4 rounded-xl shadow-sm" style={{ flex: 0.25 }}>
                        <View className="flex-row items-center">
                            <Text className="font-semibold text-gray-800 text-sm mr-2">
                                🏪 Fournisseur
                            </Text>
                        </View>
                        {renderSupplier()}
                    </View>
                </View>
            </View>
        </Layout>
    );
};
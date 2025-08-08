import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../../components/common/Layout';
import { Button, Input } from '../../components/ui';
import { colors } from '../../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProducts, searchProducts, clearSearchResults, setSearchTerm } from '../../store/slices/productSlice';
import { Product } from '../../types/product.types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useDebounce } from '../../hooks/useDebounce';

type ProductScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface ProductScreenProps {
    route?: { params?: { productId?: number } };
}

export const ProductScreen: React.FC<ProductScreenProps> = ({ route }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, searchResults, isLoading, isSearching, searchTerm, error } = useSelector((state: RootState) => state.products);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const debouncedSearchTerm = useDebounce(localSearchTerm, 1000); // Debounce for 1s
    const navigation = useNavigation<ProductScreenNavigationProp>();

    // Fetch initial products on mount and clear search results on unmount
    useEffect(() => {
        dispatch(fetchProducts({ page: 1 }));
        return () => {
            dispatch(clearSearchResults());
        };
    }, [dispatch]);

    // Trigger search when debounced search term changes
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            dispatch(setSearchTerm(debouncedSearchTerm));
            dispatch(searchProducts(debouncedSearchTerm));
        } else {
            dispatch(clearSearchResults());
        }
    }, [debouncedSearchTerm, dispatch]);

    const handleClearSearch = () => {
        setLocalSearchTerm('');
        dispatch(clearSearchResults());
    };

    const renderProductItem = ({ item }: { item: Product }) => {
        const totalStock = item.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0;
        const priceCaisse = item.priceCaisse != null ? parseFloat(String(item.priceCaisse)) : null;
        const priceGestcom = item.priceGestcom != null ? parseFloat(String(item.priceGestcom)) : null;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetails', { productId: item.idProduct })}
                className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
            >
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                    {item.productName}
                </Text>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-sm text-gray-500">
                            Code: {item.productCode}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Barcode: {item.barcodeValue}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-sm text-gray-500">
                            Stock: {totalStock}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Caisse: {priceCaisse != null && !isNaN(priceCaisse) ? `€${priceCaisse.toFixed(2)}` : 'N/A'}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Gestcom: {priceGestcom != null && !isNaN(priceGestcom) ? `€${priceGestcom.toFixed(2)}` : 'N/A'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Layout backgroundColor={colors.white} padding={false}>
            <View className="flex-1 bg-gray-50">
                <View className="p-4 bg-white border-b border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">
                        Products
                    </Text>
                    <View className="flex-row items-center space-x-2">
                        <Input
                            placeholder="Search by name, code, or barcode..."
                            value={localSearchTerm}
                            onChangeText={setLocalSearchTerm}
                            containerStyle="flex-1"
                            style={{ backgroundColor: colors.white }}
                        />
                        {localSearchTerm.length > 0 && (
                            <Button
                                title="Clear"
                                variant="outline"
                                size="small"
                                onPress={handleClearSearch}
                            />
                        )}
                    </View>
                </View>
                <View className="flex-1 p-4">
                    {(isLoading || isSearching) && (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text className="text-gray-500 mt-2">Loading...</Text>
                        </View>
                    )}
                    {!isLoading && !isSearching && products.length === 0 && searchResults.length === 0 && (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-gray-500 text-lg">
                                No products found
                            </Text>
                        </View>
                    )}
                    {!isLoading && !isSearching && (products.length > 0 || searchResults.length > 0) && (
                        <FlatList
                            data={searchTerm ? searchResults : products}
                            renderItem={renderProductItem}
                            keyExtractor={(item) => item.idProduct.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Layout>
    );
};
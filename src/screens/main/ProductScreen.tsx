// src/screens/main/ProductScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Layout } from '../../components/common/Layout';
import { colors } from '../../constants/colors';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    fetchProducts,
    searchProducts,
    clearSearchResults,
    setSearchTerm,
    resetProducts,
    clearError,
} from '../../store/slices/productSlice';
import { Product } from '../../types/product.types';
import { Search, X, Package, DollarSign, Hash, BarChart } from 'react-native-feather';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

interface ProductItemProps {
    product: Product;
    onPress: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
    const formattedPrice = useMemo(() => {
        const price = Number(product.priceCaisse);
        return isNaN(price) ? '0.00' : price.toFixed(2);
    }, [product.priceCaisse]);

    return (
        <TouchableOpacity
            className="mx-4 mb-3 bg-white rounded-xl p-4"
            style={{
                shadowColor: colors.textMuted,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
            }}
            onPress={() => onPress(product)}
        >
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                    <Text
                        className="text-lg font-bold mb-1"
                        style={{ color: colors.text }}
                        numberOfLines={2}
                    >
                        {product.productName}
                    </Text>

                    <View className="flex-row items-center mb-2">
                        <View className="flex-row items-center mr-4">
                            <Hash width={14} height={14} stroke={colors.textLight} />
                            <Text
                                className="text-sm ml-1"
                                style={{ color: colors.textLight }}
                            >
                                {product.productCode}
                            </Text>
                        </View>

                        {product.barcodeValue && (
                            <View className="flex-row items-center">
                                <BarChart width={14} height={14} stroke={colors.textLight} />
                                <Text
                                    className="text-sm ml-1"
                                    style={{ color: colors.textLight }}
                                >
                                    {product.barcodeValue}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Package width={16} height={16} stroke={colors.primary} />
                            <Text
                                className="text-sm ml-1 font-semibold"
                                style={{ color: colors.primary }}
                            >
                                Qté: {product.productQuantity}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <DollarSign width={16} height={16} stroke={colors.success} />
                            <Text
                                className="text-sm ml-1 font-semibold"
                                style={{ color: colors.success }}
                            >
                                {formattedPrice} €
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                        backgroundColor: product.productQuantity > 0 ? `${colors.success}20` : `${colors.error}20`,
                    }}
                >
                    <Text className="text-xl">
                        {product.productQuantity > 0 ? '✅' : '❌'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ProductSeparator: React.FC = () => (
    <View
        className="mx-4 h-px my-2"
        style={{ backgroundColor: colors.neutral + '30' }}
    />
);

const EmptyList: React.FC<{ isSearching: boolean; searchTerm: string }> = ({ isSearching, searchTerm }) => (
    <View className="flex-1 items-center justify-center py-12">
        <Text className="text-6xl mb-4">📦</Text>
        <Text
            className="text-xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
        >
            {isSearching ? 'Aucun résultat' : 'Aucun produit'}
        </Text>
        <Text
            className="text-base text-center px-8"
            style={{ color: colors.textLight }}
        >
            {isSearching
                ? `Aucun produit trouvé pour "${searchTerm}"`
                : 'Aucun produit disponible pour le moment'
            }
        </Text>
    </View>
);

export const ProductScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        products,
        searchResults,
        currentPage,
        hasNextPage,
        isLoading,
        isLoadingMore,
        isSearching,
        searchTerm,
        error,
    } = useAppSelector((state) => state.products);

    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            if (term.trim().length >= 2) {
                setIsSearchMode(true);
                dispatch(setSearchTerm(term));
                dispatch(searchProducts(term));
            } else if (term.trim().length === 0) {
                setIsSearchMode(false);
                dispatch(clearSearchResults());
                if (products.length === 0) {
                    dispatch(fetchProducts({ page: 1, refresh: true }));
                }
            }
        }, 500),
        [dispatch, products.length]
    );

    // Handle search input change
    const handleSearchChange = useCallback((text: string) => {
        setLocalSearchTerm(text);
        debouncedSearch(text);
    }, [debouncedSearch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setIsSearchMode(false);
        dispatch(clearSearchResults());
        if (products.length === 0) {
            dispatch(fetchProducts({ page: 1, refresh: true }));
        }
    }, [dispatch, products.length]);

    // Load initial data
    useEffect(() => {
        if (products.length === 0 && !isSearchMode) {
            dispatch(fetchProducts({ page: 1, refresh: true }));
        }
    }, [dispatch, products.length, isSearchMode]);

    // Load more products
    const loadMoreProducts = useCallback(() => {
        if (!isSearchMode && hasNextPage && !isLoadingMore && !isLoading) {
            dispatch(fetchProducts({
                page: currentPage + 1,
                search: searchTerm || undefined
            }));
        }
    }, [dispatch, currentPage, hasNextPage, isLoadingMore, isLoading, isSearchMode, searchTerm]);

    // Refresh products
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (isSearchMode && localSearchTerm.trim()) {
                await dispatch(searchProducts(localSearchTerm.trim())).unwrap();
            } else {
                dispatch(resetProducts());
                await dispatch(fetchProducts({ page: 1, refresh: true })).unwrap();
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [dispatch, isSearchMode, localSearchTerm]);

    // Handle product selection
    const handleProductPress = useCallback((product: Product) => {
        const formattedPrice = useMemo(() => {
            const price = Number(product.priceCaisse);
            return isNaN(price) ? '0.00' : price.toFixed(2);
        }, [product.priceCaisse]);

        Alert.alert(
            product.productName,
            `Code: ${product.productCode}\nCode-barres: ${product.barcodeValue}\nQuantité: ${product.productQuantity}\nPrix: ${formattedPrice} €  `,
            [
                {
                    text: 'Fermer',
                    style: 'cancel',
                },
                {
                    text: 'Voir détails',
                    onPress: () => {
                        // Navigation vers les détails du produit
                        console.log('Navigate to product details:', product.idProduct);
                    },
                },
            ]
        );
    }, []);

    // Show error
    useEffect(() => {
        if (error) {
            Alert.alert('Erreur', error, [
                {
                    text: 'OK',
                    onPress: () => dispatch(clearError()),
                },
            ]);
        }
    }, [error, dispatch]);

    // Data to display
    const displayData = useMemo(() => {
        return isSearchMode ? searchResults : products;
    }, [isSearchMode, searchResults, products]);

    // Render footer
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }, [isLoadingMore]);

    // Render header with stats
    const renderHeader = useCallback(() => {
        const totalProducts = isSearchMode ? searchResults.length : products.length;

        return (
            <View className="px-4 py-2 mb-2">
                <View
                    className="bg-white rounded-xl p-4 flex-row justify-between items-center"
                    style={{
                        shadowColor: colors.textMuted,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <View className="flex-1">
                        <Text
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >
                            {isSearchMode ? 'Résultats de recherche' : 'Tous les produits'}
                        </Text>
                        <Text
                            className="text-sm"
                            style={{ color: colors.textLight }}
                        >
                            {totalProducts} produit{totalProducts !== 1 ? 's' : ''} 
                        </Text>
                    </View>
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primaryLight }}
                    >
                        <Package width={20} height={20} stroke={colors.white} />
                    </View>
                </View>
            </View>
        );
    }, [isSearchMode, searchResults.length, products.length]);

    return (
        <Layout safeArea={false} padding={false}>
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                {/* Search Header */}
                <View
                    className="px-4 py-3"
                    style={{
                        backgroundColor: colors.white,
                        shadowColor: colors.textMuted,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-center">
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Search width={20} height={20} stroke={colors.textLight} />
                            <TextInput
                                className="flex-1 ml-3 text-base"
                                placeholder="Rechercher par nom, code ou code-barres..."
                                placeholderTextColor={colors.textLight}
                                value={localSearchTerm}
                                onChangeText={handleSearchChange}
                                style={{ color: colors.text }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {localSearchTerm.length > 0 && (
                                <TouchableOpacity onPress={clearSearch} className="ml-2">
                                    <X width={20} height={20} stroke={colors.textLight} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Content */}
                {isLoading && displayData.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text
                            className="text-base mt-4"
                            style={{ color: colors.textLight }}
                        >
                            Chargement des produits...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={displayData}
                        keyExtractor={(item) => item.idProduct.toString()}
                        renderItem={({ item }) => (
                            <ProductItem product={item} onPress={handleProductPress} />
                        )}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={
                            <EmptyList isSearching={isSearchMode} searchTerm={localSearchTerm} />
                        }
                        ListFooterComponent={renderFooter}
                        ItemSeparatorComponent={ProductSeparator}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        onEndReached={loadMoreProducts}
                        onEndReachedThreshold={0.3}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingTop: 8,
                            paddingBottom: 20,
                            flexGrow: 1,
                        }}
                        getItemLayout={(data, index) => ({
                            length: 120, // Hauteur approximative d'un item
                            offset: 120 * index,
                            index,
                        })}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                    />
                )}
            </View>
        </Layout>
    );
};
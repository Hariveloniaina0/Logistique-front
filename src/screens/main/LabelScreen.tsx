import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../../components/common/Layout';
import { Button, Input } from '../../components/ui';
import { colors } from '../../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { searchProducts, clearSearchResults, setSearchTerm } from '../../store/slices/productSlice';
import { fetchFtpConfig } from '../../store/slices/ftpSlice';
import { Product } from '../../types/product.types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useDebounce } from '../../hooks/useDebounce';
import { exportService } from '../../services/export.service';
import { Picker } from '@react-native-picker/picker';

type LabelScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const LabelScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { searchResults, isSearching, searchTerm, error } = useSelector((state: RootState) => state.products);
    const { config: ftpConfig, isLoading: isFtpLoading, error: ftpError } = useSelector((state: RootState) => state.ftp);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [labelQuantity, setLabelQuantity] = useState('');
    const [isExporting, setIsExporting] = useState(false); // New state for export loading
    const debouncedSearchTerm = useDebounce(localSearchTerm, 1000);
    const navigation = useNavigation<LabelScreenNavigationProp>();
    const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('csv');

    useEffect(() => {
        dispatch(fetchFtpConfig());
    }, [dispatch]);

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
        setSelectedProduct(null);
        dispatch(clearSearchResults());
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setLocalSearchTerm('');
        dispatch(clearSearchResults());
    };

    const handleExport = async () => {
        if (!selectedProduct || !labelQuantity || isNaN(parseInt(labelQuantity)) || parseInt(labelQuantity) <= 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner un produit et entrer un nombre d\'étiquettes valide.');
            return;
        }

        let serverName = ftpConfig?.host || null;
        if (!serverName) {
            try {
                const config = await dispatch(fetchFtpConfig()).unwrap();
                serverName = config?.host || 'Serveur non configuré';
            } catch (error) {
                serverName = 'Serveur non configuré';
            }
        }

        const cleanServerName = serverName
            ?.replace(/^(ftp:\/\/|sftp:\/\/|https?:\/\/)/i, '')
            ?.replace(/\/+$/, '')
            ?.trim() || 'Serveur non configuré';

        const formatName = selectedFormat === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)';

        Alert.alert(
            'Confirmation d\'export',
            `Voulez-vous exporter ${labelQuantity} étiquette(s) pour "${selectedProduct.productName}" au format ${formatName} vers le serveur :\n\n${cleanServerName}`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Exporter',
                    style: 'default',
                    onPress: async () => {
                        setIsExporting(true); // Start loading
                        try {
                            const response = await exportService.exportLabels({
                                barcode: selectedProduct.barcodeValue,
                                labelQuantity: parseInt(labelQuantity),
                                format: selectedFormat
                            });
                            setIsExporting(false); // Stop loading
                            Alert.alert('Succès', response.message || 'Étiquettes exportées avec succès');
                            setLabelQuantity('');
                            setSelectedProduct(null);
                            setSelectedFormat('csv');
                        } catch (error: any) {
                            setIsExporting(false); // Stop loading on error
                            Alert.alert('Erreur', error.message || 'Échec de l\'export des étiquettes');
                        }
                    }
                }
            ]
        );
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            onPress={() => handleSelectProduct(item)}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
        >
            <Text className="text-lg font-semibold text-gray-800 mb-1">{item.productName}</Text>
            <View className="flex-row justify-between">
                <View>
                    <Text className="text-sm text-gray-500">Code: {item.productCode}</Text>
                    <Text className="text-sm text-gray-500">Barcode: {item.barcodeValue}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Layout backgroundColor={colors.white} padding={false}>
            <View className="flex-1 bg-gray-50">
                <View className="p-4 bg-white border-b border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">Générer des étiquettes</Text>
                    <View className="flex-row items-center space-x-2">
                        <Input
                            placeholder="Rechercher par nom, code ou barcode..."
                            value={localSearchTerm}
                            onChangeText={setLocalSearchTerm}
                            containerStyle="flex-1"
                            style={{ backgroundColor: colors.white }}
                        />
                        {localSearchTerm.length > 0 && (
                            <Button
                                title="Effacer"
                                variant="outline"
                                size="small"
                                onPress={handleClearSearch}
                            />
                        )}
                    </View>
                </View>
                <View className="flex-1 p-4">
                    {isFtpLoading && (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text className="text-gray-500 mt-2">Chargement de la configuration FTP...</Text>
                        </View>
                    )}
                    {ftpError && (
                        <Text className="text-red-500 text-center mt-4">{ftpError}</Text>
                    )}
                    {!isFtpLoading && !ftpError && (
                        <>
                            {isSearching && (
                                <View className="flex-1 items-center justify-center">
                                    <ActivityIndicator size="large" color={colors.primary} />
                                    <Text className="text-gray-500 mt-2">Recherche en cours...</Text>
                                </View>
                            )}
                            {!isSearching && searchResults.length > 0 && !selectedProduct && (
                                <FlatList
                                    data={searchResults}
                                    renderItem={renderProductItem}
                                    keyExtractor={(item) => item.idProduct.toString()}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                            {!isSearching && searchResults.length === 0 && !selectedProduct && localSearchTerm.trim() && (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-gray-500 text-lg">Aucun produit trouvé</Text>
                                </View>
                            )}
                            {selectedProduct && (
                                <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
                                    <Text className="text-lg font-semibold text-gray-800 mb-2">
                                        Produit sélectionné: {selectedProduct.productName}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mb-2">Code: {selectedProduct.productCode}</Text>
                                    <Text className="text-sm text-gray-500 mb-4">Barcode: {selectedProduct.barcodeValue}</Text>

                                    <Input
                                        placeholder="Nombre d'étiquettes"
                                        value={labelQuantity}
                                        onChangeText={setLabelQuantity}
                                        keyboardType="numeric"
                                        containerStyle="mb-4"
                                        style={{ backgroundColor: colors.white }}
                                    />

                                    <View className="mb-4">
                                        <Text className="text-base font-medium text-gray-700 mb-2">Format d'export :</Text>
                                        <View
                                            className="border border-gray-300 rounded-lg"
                                            style={{ backgroundColor: colors.white }}
                                        >
                                            <Picker
                                                selectedValue={selectedFormat}
                                                onValueChange={(itemValue) => setSelectedFormat(itemValue)}
                                                style={{ height: 50 }}
                                            >
                                                <Picker.Item label="CSV (.csv)" value="csv" />
                                                <Picker.Item label="Excel (.xlsx)" value="excel" />
                                            </Picker>
                                        </View>
                                    </View>

                                    <View className="relative">
                                        <Button
                                            title={isExporting ? 'Exportation...' : `Exporter en ${selectedFormat.toUpperCase()}`}
                                            variant="primary"
                                            size="large"
                                            onPress={handleExport}
                                            disabled={isExporting}
                                            style={{
                                                borderRadius: 12,
                                                shadowColor: colors.primary,
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 8,
                                                elevation: 5,
                                            }}
                                        />
                                        {isExporting && (
                                            <ActivityIndicator
                                                size="small"
                                                color={colors.white}
                                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                            />
                                        )}
                                    </View>
                                    <Button
                                        title="Annuler la sélection"
                                        variant="outline"
                                        size="medium"
                                        onPress={() => {
                                            setSelectedProduct(null);
                                            setSelectedFormat('csv');
                                        }}
                                        style={{ marginTop: 10 }}
                                        disabled={isExporting}
                                    />
                                </View>
                            )}
                            {error && (
                                <Text className="text-red-500 text-center mt-4">{error}</Text>
                            )}
                        </>
                    )}
                </View>
            </View>
        </Layout>
    );
};
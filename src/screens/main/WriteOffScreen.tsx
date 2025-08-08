import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { WriteOff, WriteOffType } from '../../types/writeOff.types';
import { useWriteOff } from '../../hooks/useWriteOff';

type WriteOffScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const WriteOffScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { searchResults, isSearching, searchTerm, error: productError } = useSelector((state: RootState) => state.products);
    const { config: ftpConfig, isLoading: isFtpLoading, error: ftpError } = useSelector((state: RootState) => state.ftp);
    const { writeOffs, isLoading: isWriteOffLoading, error: writeOffError } = useSelector((state: RootState) => state.writeOff);
    
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [writeOffQuantity, setWriteOffQuantity] = useState('');
    const [writeOffType, setWriteOffType] = useState<WriteOffType>('damage');
    const [isExporting, setIsExporting] = useState(false);
    
    const debouncedSearchTerm = useDebounce(localSearchTerm, 1000);
    const navigation = useNavigation<WriteOffScreenNavigationProp>();
    const { loadWriteOffs } = useWriteOff();
    
    // Utiliser useRef pour éviter les re-renders inutiles
    const hasLoadedWriteOffs = useRef(false);
    const hasLoadedFtpConfig = useRef(false);

    // Charger la configuration FTP au montage du composant
    useEffect(() => {
        if (!hasLoadedFtpConfig.current && !ftpConfig && !isFtpLoading) {
            hasLoadedFtpConfig.current = true;
            dispatch(fetchFtpConfig());
        }
    }, []); // Dépendances vides pour ne s'exécuter qu'une fois

    // Charger les writeOffs au montage du composant
    useEffect(() => {
        if (!hasLoadedWriteOffs.current && !isWriteOffLoading && writeOffs.length === 0) {
            hasLoadedWriteOffs.current = true;
            loadWriteOffs();
        }
    }, []); // Dépendances vides pour ne s'exécuter qu'une fois
    
    // Gérer la recherche de produits
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            dispatch(setSearchTerm(debouncedSearchTerm));
            dispatch(searchProducts(debouncedSearchTerm));
        } else {
            dispatch(clearSearchResults());
        }
    }, [debouncedSearchTerm, dispatch]);

    const handleClearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setSelectedProduct(null);
        dispatch(clearSearchResults());
    }, [dispatch]);

    const handleSelectProduct = useCallback((product: Product) => {
        setSelectedProduct(product);
        setLocalSearchTerm('');
        dispatch(clearSearchResults());
    }, [dispatch]);

    const refreshWriteOffs = useCallback(async () => {
        hasLoadedWriteOffs.current = false;
        await loadWriteOffs();
        hasLoadedWriteOffs.current = true;
    }, [loadWriteOffs]);

    const handleExport = useCallback(async () => {
        if (!selectedProduct || !writeOffQuantity || isNaN(parseInt(writeOffQuantity)) || parseInt(writeOffQuantity) <= 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner un produit et entrer un nombre valide de démarques.');
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

        const writeOffTypeName = {
            damage: 'Dommage',
            theft: 'Vol',
            unsold: 'Invendu'
        }[writeOffType];

        Alert.alert(
            'Confirmation d\'export',
            `Voulez-vous exporter ${writeOffQuantity} démarque(s) de type "${writeOffTypeName}" pour "${selectedProduct.productName}" vers le serveur :\n\n${cleanServerName}`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Exporter',
                    style: 'default',
                    onPress: async () => {
                        setIsExporting(true);
                        try {
                            const response = await exportService.exportWriteOff({
                                barcode: selectedProduct.barcodeValue,
                                writeOffType,
                                writeOffQuantity: parseInt(writeOffQuantity)
                            });
                            setIsExporting(false);
                            Alert.alert('Succès', response.message || 'Démarque exportée avec succès');
                            setWriteOffQuantity('');
                            setSelectedProduct(null);
                            setWriteOffType('damage');
                            // Recharger la liste des writeOffs après export
                            await refreshWriteOffs();
                        } catch (error: any) {
                            setIsExporting(false);
                            Alert.alert('Erreur', error.message || 'Échec de l\'export de la démarque');
                        }
                    }
                }
            ]
        );
    }, [selectedProduct, writeOffQuantity, writeOffType, ftpConfig, dispatch, refreshWriteOffs]);

    const renderProductItem = useCallback(({ item }: { item: Product }) => (
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
    ), [handleSelectProduct]);

    const renderWriteOffItem = useCallback(({ item }: { item: WriteOff }) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-1">{item.product.productName}</Text>
            <View className="flex-row justify-between">
                <View>
                    <Text className="text-sm text-gray-500">Type: {item.writeOffType}</Text>
                    <Text className="text-sm text-gray-500">Quantité: {item.writeOffQuantity}</Text>
                    <Text className="text-sm text-gray-500">Commentaire: {item.writeOffComment}</Text>
                    <Text className="text-sm text-gray-500">Date: {new Date(item.writeOffDate).toLocaleDateString()}</Text>
                </View>
            </View>
        </View>
    ), []);

    return (
        <Layout backgroundColor={colors.white} padding={false}>
            <View className="flex-1 bg-gray-50">
                <View className="p-4 bg-white border-b border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">Générer des démarques</Text>
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
                                        placeholder="Quantités de démarque"
                                        value={writeOffQuantity}
                                        onChangeText={setWriteOffQuantity}
                                        keyboardType="numeric"
                                        containerStyle="mb-4"
                                        style={{ backgroundColor: colors.white }}
                                    />

                                    <View className="mb-4">
                                        <Text className="text-base font-medium text-gray-700 mb-2">Type de démarque :</Text>
                                        <View
                                            className="border border-gray-300 rounded-lg"
                                            style={{ backgroundColor: colors.white }}
                                        >
                                            <Picker
                                                selectedValue={writeOffType}
                                                onValueChange={(itemValue) => setWriteOffType(itemValue)}
                                                style={{ height: 50 }}
                                            >
                                                <Picker.Item label="Dommage" value="damage" />
                                                <Picker.Item label="Vol" value="theft" />
                                                <Picker.Item label="Invendu" value="unsold" />
                                            </Picker>
                                        </View>
                                    </View>

                                    <View className="relative">
                                        <Button
                                            title={isExporting ? 'Exportation...' : 'Exporter la démarque'}
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
                                            setWriteOffType('damage');
                                        }}
                                        style={{ marginTop: 10 }}
                                        disabled={isExporting}
                                    />
                                </View>
                            )}
                            {writeOffError && (
                                <Text className="text-red-500 text-center mt-4">{writeOffError}</Text>
                            )}
                            {productError && (
                                <Text className="text-red-500 text-center mt-4">{productError}</Text>
                            )}
                            <View className="mt-4">
                                <Text className="text-xl font-bold text-gray-800 mb-4">Historique des démarques</Text>
                                {isWriteOffLoading && (
                                    <View className="flex-1 items-center justify-center">
                                        <ActivityIndicator size="large" color={colors.primary} />
                                        <Text className="text-gray-500 mt-2">Chargement des démarques...</Text>
                                    </View>
                                )}
                                {!isWriteOffLoading && writeOffs.length > 0 && (
                                    <FlatList
                                        data={writeOffs}
                                        renderItem={renderWriteOffItem}
                                        keyExtractor={(item) => item.idWriteOff.toString()}
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                        showsVerticalScrollIndicator={false}
                                    />
                                )}
                                {!isWriteOffLoading && writeOffs.length === 0 && !writeOffError && (
                                    <View className="flex-1 items-center justify-center">
                                        <Text className="text-gray-500 text-lg">Aucune démarque</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Layout>
    );
};
// src/screens/main/ImportScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { colors } from '../../constants/colors';
import * as DocumentPicker from 'expo-document-picker'; // ✅ Expo-compatible picker
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../../services/api';

export const ImportScreen: React.FC = () => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedFields = [
    'productCode',
    'barcodeValue',
    'productName',
    'productQuantity',
    'priceCaisse',
    'priceGestcom',
    'storeName',
    'warehouseName',
    'supplierName',
  ];

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        await extractHeaders(result.assets[0]);
      }

    } catch (err) {
      console.error('Document pick error:', err);
      setError("Erreur lors de la sélection du fichier");
    }
  };

  const extractHeaders = async (selectedFile: DocumentPicker.DocumentPickerAsset) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
      } as any);

      const response = await apiService.post<{ headers: string[] }>('/import/headers', formData);
      setHeaders(response.headers);
    } catch (err) {
      setError("Erreur lors de l'extraction des en-têtes");
      console.error(err);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderMapping = (header: string, field: string) => {
    setMappings((prev) => ({
      ...prev,
      [header]: field,
    }));
  };

  const handleImport = async () => {
    if (!file) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }

    const requiredFields = ['productCode', 'barcodeValue', 'productName'];
    const mappedFields = Object.values(mappings);

    for (const field of requiredFields) {
      if (!mappedFields.includes(field)) {
        Alert.alert('Erreur', `Le champ obligatoire ${field} doit être mappé`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
      formData.append('mappings', JSON.stringify(mappings));

      const response = await apiService.post<{ message: string; importedCount: number }>('/import/products', formData);
      Alert.alert('Succès', response.message);
      setFile(null);
      setHeaders([]);
      setMappings({});
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'importation");
      Alert.alert('Erreur', 'Impossible d\'importer le fichier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
          <View className="flex-1">
            <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Importer des données
            </Text>

            {/* File Picker */}
            <View className="mb-6">
              <Button
                title={file ? file.name || 'Fichier sélectionné' : 'Sélectionner un fichier (CSV/Excel)'}
                variant="outline"
                onPress={pickFile}
                disabled={isLoading}
              />
              {error && (
                <Text className="text-sm mt-2" style={{ color: colors.error }}>
                  {error}
                </Text>
              )}
            </View>

            {/* Header Mapping */}
            {headers.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                  Mapper les colonnes
                </Text>
                {headers.map((header, index) => (
                  <View key={index} className="mb-4">
                    <Text className="text-base mb-2" style={{ color: colors.text }}>
                      Colonne: {header}
                    </Text>
                    <View className="border rounded-lg" style={{ borderColor: colors.neutral, backgroundColor: colors.white }}>
                      <Picker
                        selectedValue={mappings[header] || ''}
                        onValueChange={(value: string) => handleHeaderMapping(header, value)}
                        style={{ height: 50 }}
                      >
                        <Picker.Item label="Sélectionner un champ" value="" />
                        {expectedFields.map((field) => (
                          <Picker.Item key={field} label={field} value={field} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Import Button */}
            <Button
              title="Importer"
              variant="primary"
              size="large"
              onPress={handleImport}
              loading={isLoading}
              disabled={isLoading || !file}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

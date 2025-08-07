import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { colors } from '../../constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { importService, FieldMapping, ImportHeaders, ImportResult } from '../../services/import.service';

interface ImportStep {
  step: number;
  title: string;
  completed: boolean;
}

export const ImportScreen: React.FC = () => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping>({});
  const [stockLocation, setStockLocation] = useState<'store' | 'warehouse' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const steps: ImportStep[] = [
    { step: 1, title: 'Sélectionner le fichier', completed: !!file },
    { step: 2, title: 'Mapper les colonnes', completed: !!file && headers.length > 0 },
    { step: 3, title: 'Choisir la localisation du stock', completed: !!stockLocation },
    { step: 4, title: 'Importer les données', completed: !!importResult },
  ];

  const availableFields = importService.getAvailableFields();

  const resetImport = () => {
    setFile(null);
    setHeaders([]);
    setMappings({});
    setStockLocation(null);
    setError(null);
    setCurrentStep(1);
    setImportResult(null);
  };

  const pickFile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        const extension = selectedFile.name.toLowerCase().split('.').pop();
        if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
          setError("Format de fichier non supporté. Veuillez sélectionner un fichier CSV ou Excel.");
          Alert.alert('Erreur', 'Format de fichier non supporté. Veuillez sélectionner un fichier CSV ou Excel.');
          return;
        }
        setFile(selectedFile);
        await extractHeaders(selectedFile);
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Document pick error:', err);
      setError("Erreur lors de la sélection du fichier");
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractHeaders = async (selectedFile: DocumentPicker.DocumentPickerAsset) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: ImportHeaders = await importService.extractHeaders(selectedFile);
      setHeaders(response.headers);

      const autoMappings: FieldMapping = {};
      response.headers.forEach((header: string) => {
        const normalizedHeader = header.toLowerCase().trim();
        if (normalizedHeader.includes('code') && normalizedHeader.includes('produit')) {
          autoMappings[header] = 'productCode';
        } else if (normalizedHeader.includes('barcode') || normalizedHeader.includes('ean') || normalizedHeader.includes('barr')) {
          autoMappings[header] = 'barcodeValue';
        } else if (normalizedHeader.includes('nom') && normalizedHeader.includes('produit')) {
          autoMappings[header] = 'productName';
        } else if (normalizedHeader.includes('quantit')) {
          autoMappings[header] = 'stockQuantity';
        } else if (normalizedHeader.includes('prix') && normalizedHeader.includes('caisse')) {
          autoMappings[header] = 'priceCaisse';
        } else if (normalizedHeader.includes('prix') && normalizedHeader.includes('gestcom')) {
          autoMappings[header] = 'priceGestcom';
        } else if (normalizedHeader.includes('magasin') || normalizedHeader.includes('store')) {
          autoMappings[header] = 'storeName';
        } else if (normalizedHeader.includes('entrep') || normalizedHeader.includes('warehouse')) {
          autoMappings[header] = 'warehouseName';
        } else if (normalizedHeader.includes('fournis') || normalizedHeader.includes('supplier')) {
          autoMappings[header] = 'supplierName';
        }
      });

      setMappings(autoMappings);
      console.log('Auto-mappings applied:', autoMappings);
    } catch (err: any) {
      console.error('Header extraction error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Impossible d\'extraire les en-têtes du fichier';
      if (err.response?.status === 401) {
        errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Fichier invalide ou mal formaté.';
      } else if (err.message.includes('Failed to extract headers')) {
        errorMessage = 'Erreur lors de l\'extraction des en-têtes. Vérifiez le format du fichier.';
      }
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderMapping = (header: string, field: string) => {
    setMappings((prev: any) => ({
      ...prev,
      [header]: field,
    }));
  };

  const validateAndProceed = () => {
    if (!file) {
      Alert.alert('Erreur', 'Aucun fichier sélectionné');
      return;
    }

    const validation = importService.validateMappings(mappings);

    if (!validation.isValid) {
      Alert.alert('Erreur de mapping', validation.errors.join('\n'));
      return;
    }

    setCurrentStep(3);
  };

  const handleImport = async () => {
    if (!file || !stockLocation) return;

    try {
      setIsLoading(true);
      setError(null);

      const result: ImportResult = await importService.importProducts(file, mappings);

      setImportResult(result);
      setCurrentStep(4);

      Alert.alert(
        'Import réussi! 🎉',
        `${result.importedCount} produits ont été importés avec succès.${result.skippedCount ? ` ${result.skippedCount} lignes ignorées.` : ''}`,
        [
          { text: 'Nouvel import', onPress: resetImport },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (err: any) {
      console.error('Import error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'importation';
      setError(errorMessage);
      Alert.alert('Erreur d\'importation', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-between items-center mb-6 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.step}>
          <View className="items-center flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${step.completed
                ? 'bg-green-500'
                : currentStep === step.step
                  ? `bg-[${colors.primary}]`
                  : `bg-[${colors.neutral}]`
                }`}
            >
              {step.completed ? (
                <Text className="text-white text-xs font-bold">✓</Text>
              ) : (
                <Text className="text-white text-xs font-bold">{step.step}</Text>
              )}
            </View>
            <Text
              className={`text-xs mt-1 text-center ${step.completed || currentStep === step.step
                ? `text-[${colors.text}]`
                : `text-[${colors.textMuted}]`
                }`}
            >
              {step.title}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              className={`h-0.5 flex-1 mx-2 ${steps[index + 1].completed ? 'bg-green-500' : `bg-[${colors.neutral}]`
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderFileSelection = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        📁 Sélectionner un fichier
      </Text>

      {file ? (
        <View className="bg-white p-4 rounded-lg border mb-4" style={{ borderColor: colors.success }}>
          <Text className="font-medium" style={{ color: colors.text }}>
            Fichier sélectionné:
          </Text>
          <Text style={{ color: colors.textLight }}>{file.name}</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Taille: {file.size ? (file.size / 1024).toFixed(2) + ' Ko' : 'Taille inconnue'}
          </Text>
        </View>
      ) : null}

      <Button
        title={file ? 'Changer de fichier' : 'Sélectionner un fichier (CSV/Excel)'}
        variant={file ? 'outline' : 'primary'}
        onPress={pickFile}
        disabled={isLoading}
      />

      <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>
        Formats supportés: CSV, Excel (.xlsx, .xls)
      </Text>
    </View>
  );

  const renderMappingSection = () => {
    if (!headers.length) return null;

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          🔗 Mapper les colonnes
        </Text>

        <Text className="text-sm mb-4" style={{ color: colors.textLight }}>
          Associez chaque colonne de votre fichier avec les champs correspondants:
        </Text>

        {headers.map((header, index) => {
          const mappedField = availableFields.find(f => f.value === mappings[header]);
          return (
            <View key={index} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  📊 {header}
                </Text>
                {mappedField?.required && (
                  <Text className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: `${colors.error}20`,
                    color: colors.error
                  }}>
                    Obligatoire
                  </Text>
                )}
              </View>

              <View className="border rounded-lg" style={{
                borderColor: colors.neutral,
                backgroundColor: colors.white
              }}>
                <Picker
                  selectedValue={mappings[header] || ''}
                  onValueChange={(value: string) => handleHeaderMapping(header, value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="-- Ignorer cette colonne --" value="" />
                  {availableFields.map((field) => (
                    <Picker.Item
                      key={field.value}
                      label={`${field.label}${field.required ? ' *' : ''}`}
                      value={field.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          );
        })}

        <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.info}10` }}>
          <Text className="text-sm" style={{ color: colors.info }}>
            💡 Conseil: Les mappings automatiques ont été appliqués basés sur les noms de colonnes.
            Vérifiez et ajustez si nécessaire.
          </Text>
        </View>

        <Button
          title="Suivant"
          variant="primary"
          onPress={validateAndProceed}
          disabled={isLoading || !file || headers.length === 0}
        />
      </View>
    );
  };

  const renderStockLocationSelection = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        🏬 Choisir la localisation du stock
      </Text>

      <Text className="text-sm mb-4" style={{ color: colors.textLight }}>
        Sélectionnez où la quantité de stock doit être enregistrée:
      </Text>

      <View className="border rounded-lg" style={{
        borderColor: colors.neutral,
        backgroundColor: colors.white
      }}>
        <Picker
          selectedValue={stockLocation || ''}
          onValueChange={(value: 'store' | 'warehouse' | '') => setStockLocation(value || null)}
          style={{ height: 50 }}
        >
          <Picker.Item label="-- Sélectionner une localisation --" value="" />
          <Picker.Item label="Entrepôt" value="warehouse" />
          <Picker.Item label="Magasin" value="store" />
        </Picker>
      </View>

      <Button
        title="Suivant"
        variant="primary"
        onPress={() => setCurrentStep(4)}
        disabled={isLoading || !stockLocation}
      />
    </View>
  );

  const renderImportSection = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        🚀 Lancer l'importation
      </Text>

      {importResult ? (
        <View className="bg-white p-4 rounded-lg border mb-4" style={{ borderColor: colors.success }}>
          <Text className="font-medium text-green-600 mb-2">
            ✅ Import terminé avec succès!
          </Text>
          <Text style={{ color: colors.text }}>
            {importResult.importedCount} produits importés
          </Text>
          {importResult.skippedCount ? (
            <Text style={{ color: colors.text }}>
              {importResult.skippedCount} lignes ignorées
            </Text>
          ) : null}
          {importResult.errors && importResult.errors.length > 0 && (
            <View className="mt-2">
              <Text className="font-medium" style={{ color: colors.warning }}>
                ⚠️ Avertissements:
              </Text>
              {importResult.errors.map((error: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                <Text key={index} className="text-sm" style={{ color: colors.warning }}>
                  • {error}
                </Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <Button
          title="Importer les données"
          variant="primary"
          size="large"
          onPress={() => Alert.alert(
            'Confirmer l\'importation',
            `Êtes-vous sûr de vouloir importer les données du fichier "${file?.name}" ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Importer', onPress: handleImport }
            ]
          )}
          loading={isLoading}
          disabled={isLoading || !file || headers.length === 0 || !stockLocation}
        />
      )}
    </View>
  );

  return (
    <Layout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            <Text className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
              📋 Importer des données
            </Text>

            {renderStepIndicator()}

            {error && (
              <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.error}10` }}>
                <Text style={{ color: colors.error }}>❌ {error}</Text>
              </View>
            )}

            {isLoading && (
              <View className="mb-4 p-4 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-2" style={{ color: colors.textLight }}>
                  Traitement en cours...
                </Text>
              </View>
            )}

            {currentStep === 1 && renderFileSelection()}
            {currentStep === 2 && renderMappingSection()}
            {currentStep === 3 && renderStockLocationSelection()}
            {currentStep === 4 && renderImportSection()}

            {importResult && (
              <View className="mt-4">
                <Button
                  title="Nouveau fichier"
                  variant="outline"
                  onPress={resetImport}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Alert, ScrollView, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/ui';
import { colors } from '../../constants/colors';
import { useFtp } from '../../hooks/useFtp';
import { useAuth } from '../../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';
import { UserRole } from '../../types';
import { FtpConfig } from '../../types/ftp.types';

interface FtpConfigItemProps {
  config: FtpConfig;
  onEdit: (config: FtpConfig) => void;
  onDelete: (id: number) => void;
  isAdminOrManager: boolean;
}

const FtpConfigItem: React.FC<FtpConfigItemProps> = ({ config, onEdit, onDelete, isAdminOrManager }) => (
  <View className="p-4 mb-2 bg-white rounded-lg shadow-md">
    <Text className="text-lg font-semibold" style={{ color: colors.text }}>
      {config.host}
    </Text>
    <Text className="text-sm" style={{ color: colors.textLight }}>
      Utilisateur: {config.nomUtilisateur}
    </Text>
    <Text className="text-sm" style={{ color: colors.textLight }}>
      Protocole: {config.protocol.toUpperCase()} | Port: {config.port}
    </Text>
    {isAdminOrManager && (
      <View className="flex-row justify-end mt-2 space-x-2">
        <Button
          title="Modifier"
          variant="primary"
          size="small"
          onPress={() => onEdit(config)}
        />
        <Button
          title="Supprimer"
          variant="danger"
          size="small"
          onPress={() => onDelete(config.idFtp!)}
        />
      </View>
    )}
  </View>
);

export const FtpSettingsScreen: React.FC = () => {
  const { config, isLoading, error, fetchConfig, createConfig, updateConfig, deleteConfig, clearFtpError } = useFtp();
  const { user } = useAuth();
  const [configs, setConfigs] = useState<FtpConfig[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FtpConfig>({
    host: '',
    nomUtilisateur: '',
    motDePasseFtp: '',
    port: 21,
    protocol: 'ftp',
  });

  const hasInitialized = useRef(false);

  const isAdminOrManager = user?.userRole === UserRole.ADMIN || user?.userRole === UserRole.MANAGER;

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchConfigs();
    }
  }, []);

  useEffect(() => {
    if (error && error !== 'No FTP configuration found') {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: () => clearFtpError() },
      ]);
    }
  }, [error, clearFtpError]);

  const fetchConfigs = async () => {
    try {
      const result = await fetchConfig();
      if (result.success) {
        setConfigs(result.data ? [result.data] : []);
      }
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.host || !formData.nomUtilisateur || !formData.motDePasseFtp) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const result = isEditing
        ? await updateConfig(formData)
        : await createConfig(formData);
      
      if (result.success) {
        Alert.alert('Succès', isEditing ? 'Configuration FTP mise à jour' : 'Configuration FTP enregistrée');
        setModalVisible(false);
        await fetchConfigs();
        if (!isEditing) {
          setFormData({
            host: '',
            nomUtilisateur: '',
            motDePasseFtp: '',
            port: 21,
            protocol: 'ftp',
          });
        }
      } else {
        Alert.alert('Erreur', result.error || 'Échec de l\'opération');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Supprimer la configuration',
      'Êtes-vous sûr de vouloir supprimer cette configuration FTP ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteConfig();
              if (result.success) {
                Alert.alert('Succès', 'Configuration FTP supprimée');
                await fetchConfigs();
              } else {
                Alert.alert('Erreur', result.error || 'Échec de la suppression');
              }
            } catch {
              Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (config: FtpConfig) => {
    setFormData(config);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setFormData({
      host: '',
      nomUtilisateur: '',
      motDePasseFtp: '',
      port: 21,
      protocol: 'ftp',
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  return (
    <Layout>
      <View className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Configurations FTP
        </Text>

        {isAdminOrManager && (
          <Button
            title="Ajouter une configuration"
            variant="success"
            size="large"
            onPress={handleAddNew}
            style={{ marginBottom: 16 }}
          />
        )}

        <FlatList
          data={configs}
          renderItem={({ item }) => (
            <FtpConfigItem
              config={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdminOrManager={isAdminOrManager}
            />
          )}
          keyExtractor={(item) => item.idFtp?.toString() || Math.random().toString()}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-4">
              Aucune configuration FTP trouvée
            </Text>
          }
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
              <ScrollView>
                <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                  {isEditing ? 'Modifier la configuration' : 'Nouvelle configuration FTP'}
                </Text>

                {/* Host */}
                <View className="mb-4">
                  <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                    Hôte
                  </Text>
                  <TextInput
                    className="border rounded-lg p-3 text-base"
                    style={{ borderColor: colors.neutral, color: colors.text }}
                    value={formData.host}
                    onChangeText={(text) => setFormData({ ...formData, host: text })}
                    placeholder="ftp.example.com"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                {/* Username */}
                <View className="mb-4">
                  <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                    Nom d'utilisateur
                  </Text>
                  <TextInput
                    className="border rounded-lg p-3 text-base"
                    style={{ borderColor: colors.neutral, color: colors.text }}
                    value={formData.nomUtilisateur}
                    onChangeText={(text) => setFormData({ ...formData, nomUtilisateur: text })}
                    placeholder="username"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                {/* Password */}
                <View className="mb-4">
                  <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                    Mot de passe
                  </Text>
                  <TextInput
                    className="border rounded-lg p-3 text-base"
                    style={{ borderColor: colors.neutral, color: colors.text }}
                    value={formData.motDePasseFtp}
                    onChangeText={(text) => setFormData({ ...formData, motDePasseFtp: text })}
                    placeholder="********"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry
                  />
                </View>

                {/* Port */}
                <View className="mb-4">
                  <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                    Port
                  </Text>
                  <TextInput
                    className="border rounded-lg p-3 text-base"
                    style={{ borderColor: colors.neutral, color: colors.text }}
                    value={formData.port.toString()}
                    onChangeText={(text) => setFormData({ ...formData, port: parseInt(text) || 21 })}
                    placeholder="21"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Protocol */}
                <View className="mb-6">
                  <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                    Protocole
                  </Text>
                  <View className="border rounded-lg" style={{ borderColor: colors.neutral }}>
                    <Picker
                      selectedValue={formData.protocol}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          protocol: value as 'ftp' | 'sftp',
                          port: value === 'sftp' ? 22 : 21,
                        })
                      }
                      style={{ color: colors.text }}
                    >
                      <Picker.Item label="FTP" value="ftp" />
                      <Picker.Item label="SFTP" value="sftp" />
                    </Picker>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Button
                    title="Annuler"
                    variant="secondary"
                    size="medium"
                    onPress={() => setModalVisible(false)}
                  />
                  <Button
                    title={isEditing ? 'Mettre à jour' : 'Enregistrer'}
                    variant="success"
                    size="medium"
                    onPress={handleSave}
                    disabled={isLoading}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};
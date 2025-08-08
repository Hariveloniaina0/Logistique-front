import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button, Input } from '../../components/ui';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders, clearError, updateOrder, deleteOrder } from '../../store/slices/orderSlice';
import { colors } from '../../constants/colors';
import { apiService } from '../../services/api';
import { Product } from '../../types/product.types';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { Order } from '../../types/order.types';

// Status translation mapping
const statusTranslations: Record<string, string> = {
  in_progress: 'En cours',
  received: 'Reçu',
  canceled: 'Annulé',
};

const OrderScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error } = useAppSelector((state) => state.orders);
  const { user } = useAuth();
  const { updateOrder, deleteOrder } = useOrders();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    barcode: '',
    selectedProduct: null as Product | null,
    quantity: '',
    status: 'in_progress' as string,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearchProduct = async () => {
    if (!formData.barcode.trim()) {
      setSearchError('Veuillez entrer un code-barres');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const product = await apiService.get<Product | null>(`/products/barcode/${formData.barcode}`);
      if (product) {
        setFormData({ ...formData, selectedProduct: product });
        setSearchError(null);
      } else {
        setSearchError('Aucun produit trouvé pour ce code-barres');
      }
    } catch (err) {
      setSearchError('Erreur lors de la recherche du produit');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddOrUpdateOrder = async () => {
    if (!formData.selectedProduct || !formData.quantity) {
      Alert.alert('Erreur', 'Veuillez sélectionner un produit et entrer une quantité');
      return;
    }
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    const orderData = {
      productId: formData.selectedProduct.idProduct,
      userId: user.idUser,
      ordersQuantity: parseInt(formData.quantity, 10),
      status: formData.status,
      ordersDate: new Date(),
    };

    try {
      if (isEditing && currentOrderId) {
        await updateOrder(currentOrderId, orderData);
        Alert.alert('Succès', formData.status === 'received' ? 'Commande reçue et stock mis à jour' : 'Commande mise à jour avec succès');
      } else {
        await apiService.post('/orders', orderData);
        Alert.alert('Succès', 'Commande ajoutée avec succès');
      }
      setIsModalVisible(false);
      dispatch(fetchOrders());
      resetForm();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de l\'opération');
    }
  };

  const handleEditOrder = (order: Order) => {
    setIsEditing(true);
    setCurrentOrderId(order.idOrders);
    setFormData({
      barcode: order.product.barcodeValue || '',
      selectedProduct: order.product,
      quantity: order.ordersQuantity.toString(),
      status: order.status,
    });
    setIsModalVisible(true);
  };

  const handleDeleteOrder = (id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(id);
              Alert.alert('Succès', 'Commande supprimée avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Échec de la suppression');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      barcode: '',
      selectedProduct: null,
      quantity: '',
      status: 'in_progress',
    });
    setIsEditing(false);
    setCurrentOrderId(null);
    setSearchError(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4" style={{ color: colors.textLight }}>
            Chargement des commandes...
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Liste des commandes
        </Text>
        {error && (
          <Text className="text-center text-red-500 mt-4">{error}</Text>
        )}
        {orders.length > 0 ? (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.idOrders.toString()}
            renderItem={({ item }) => (
              <View className="p-4 mb-2 bg-white rounded-lg shadow-md">
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {item.product.productName}
                </Text>
                <Text className="text-sm" style={{ color: colors.textLight }}>
                  Quantité: {item.ordersQuantity}
                </Text>
                <Text className="text-sm" style={{ color: colors.textLight }}>
                  Statut: {statusTranslations[item.status] || item.status}
                </Text>
                <Text className="text-sm" style={{ color: colors.textLight }}>
                  Date: {new Date(item.ordersDate).toLocaleDateString()}
                </Text>
                <View className="flex-row justify-end mt-2">
                  <Button
                    title="Modifier"
                    variant="primary"
                    size="small"
                    onPress={() => handleEditOrder(item)}
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    title="Supprimer"
                    variant="danger"
                    size="small"
                    onPress={() => handleDeleteOrder(item.idOrders)}
                  />
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View className="h-px my-2" style={{ backgroundColor: colors.neutral }} />}
          />
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            Aucune commande trouvée
          </Text>
        )}
        <Button
          title="Ajouter une commande"
          variant="success"
          size="large"
          onPress={() => {
            resetForm();
            setIsModalVisible(true);
          }}
          style={{ marginTop: 16 }}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
              {isEditing ? 'Modifier la commande' : 'Ajouter une commande'}
            </Text>
            <Input
              label="Code-barres du produit"
              value={formData.barcode}
              onChangeText={(text) => setFormData({ ...formData, barcode: text })}
              placeholder="Entrez le code-barres"
              editable={!isEditing}
            />
            <Button
              title="Rechercher produit"
              variant="primary"
              onPress={handleSearchProduct}
              loading={isSearching}
              disabled={isSearching || !formData.barcode.trim() || isEditing}
            />
            {searchError && (
              <Text className="text-sm mt-2 text-[${colors.error}]">{searchError}</Text>
            )}
            {formData.selectedProduct && (
              <View className="mt-4">
                <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                  Produit sélectionné: {formData.selectedProduct.productName}
                </Text>
                <Input
                  label="Quantité"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                  placeholder="Entrez la quantité"
                  keyboardType="numeric"
                />
                <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Statut
                </Text>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="En cours" value="in_progress" />
                  <Picker.Item label="Reçu" value="received" />
                  <Picker.Item label="Annulé" value="canceled" />
                </Picker>
              </View>
            )}
            <View className="flex-row justify-between mt-4">
              <Button
                title="Annuler"
                variant="secondary"
                onPress={() => setIsModalVisible(false)}
              />
              {formData.selectedProduct && formData.quantity && (
                <Button
                  title={isEditing ? 'Mettre à jour' : 'Ajouter commande'}
                  variant="success"
                  onPress={handleAddOrUpdateOrder}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

export default OrderScreen;
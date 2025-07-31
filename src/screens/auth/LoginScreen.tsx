import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Layout } from '../../components/common/Layout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils';
import { colors } from '../../constants/colors';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { login, isLoading, error, clearAuthError } = useAuth();

  // Clear error when component mounts
  useEffect(() => {
    clearAuthError();
  }, []);

  // Show error alert when login fails
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur de connexion', error);
    }
  }, [error]);

  const validateForm = () => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError('L\'email est requis');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Le mot de passe est requis');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!validateForm()) {
      return;
    }

    const result = await login({ email: email.trim(), password });
    
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailTouched) {
      if (!text.trim()) {
        setEmailError('L\'email est requis');
      } else if (!validateEmail(text)) {
        setEmailError('Format d\'email invalide');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordTouched) {
      if (!text.trim()) {
        setPasswordError('Le mot de passe est requis');
      } else if (!validatePassword(text)) {
        setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      } else {
        setPasswordError('');
      }
    }
  };

  return (
    <Layout backgroundColor={colors.white} padding={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="flex-1 justify-center px-6">
            <View className="items-center mb-8">
              {/* Logo placeholder */}
              <View 
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-3xl font-bold" style={{ color: colors.white }}>
                  SM
                </Text>
              </View>
              
              <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                Store Manager
              </Text>
              
              <Text className="text-base text-center" style={{ color: colors.textLight }}>
                Connectez-vous pour accéder à votre tableau de bord
              </Text>
            </View>

            {/* Form Section */}
            <View className="mb-8">
              <Input
                label="Email"
                placeholder="Entrez votre email"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setEmailTouched(true)}
                error={emailError}
                touched={emailTouched}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
                error={passwordError}
                touched={passwordTouched}
                isPassword={true}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Button
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="large"
              />
            </View>

            {/* Footer */}
            <View className="items-center">
              <Text className="text-sm" style={{ color: colors.textMuted }}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

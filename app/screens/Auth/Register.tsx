import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import { Spinner } from '@/components/ui/spinner';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from '@/components/ui/image';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useShowToast } from '@/utils/Toast';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSystemRegister, setShowSystemRegister] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { isLoading } = useAuthStore();
  const showToast = useShowToast();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showToast({
        title: 'Hata',
        description: 'Şifreler eşleşmiyor',
        action: 'error',
      });
      return;
    }

    if (password.length < 6) {
      showToast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        action: 'error',
      });
      return;
    }

    try {
      // TODO: Implement actual registration
      showToast({
        title: 'Başarılı',
        description: 'Kayıt işlemi başarılı!',
        action: 'success',
      });
      router.replace('/login');
    } catch (error) {
      showToast({
        title: 'Hata',
        description: 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.',
        action: 'error',
      });
      console.error('Register error:', error);
    }
  };

  const handleSystemRegister = () => {
    setShowSystemRegister(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleGoogleRegister = () => {
    showToast({
      title: 'Bilgi',
      description: 'Google ile kayıt yakında implementlenecek',
      action: 'info',
    });
  };

  const handleAppleRegister = () => {
    showToast({
      title: 'Bilgi',
      description: 'Apple ile kayıt yakında implementlenecek',
      action: 'info',
    });
  };

  const goBackToOptions = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSystemRegister(false);
    });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormValid = 
    email.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '' && 
    fullName.trim() !== '' &&
    password === confirmPassword;

  const WelcomeScreen = () => (
    <VStack space="xl" className="w-full max-w-sm">
      {/* Brand Name */}
      <Box className="items-center mb-6">
        <Text className="text-5xl font-light text-center text-white mb-4 tracking-widest" style={{ fontFamily: 'System', letterSpacing: 4 }}>
          YERTALE
        </Text>
        
        <Text className="text-xl font-medium text-center text-gray-300">
          Hesap oluşturun
        </Text>
      </Box>

      {/* Google Register Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full mb-4 shadow-sm">
        <Button 
          onPress={handleGoogleRegister} 
          size="xl" 
          variant="outline" 
          className="bg-white h-full w-full border-0 flex-row justify-start pl-6"
        >
          <FontAwesome name="google" size={24} color="#4285F4" />
          <ButtonText className="text-gray-700 font-semibold text-lg ml-4 flex-1 text-left">Google ile kayıt ol</ButtonText>
        </Button>
      </Box>

      {/* Apple Register Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full mb-4 shadow-sm">
        <Button 
          onPress={handleAppleRegister} 
          size="xl" 
          variant="solid" 
          className="bg-black h-full w-full border border-gray-600 flex-row justify-start pl-6"
        >
          <FontAwesome name="apple" size={24} color="white" />
          <ButtonText className="text-white font-semibold text-lg ml-4 flex-1 text-left">Apple ile kayıt ol</ButtonText>
        </Button>
      </Box>

      {/* System Register Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full shadow-sm">
        <LinearGradient
          colors={['#0077be', '#00a3e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, height: 64, borderRadius: 16, width: '100%' }}
        >
          <Button 
            onPress={handleSystemRegister} 
            size="xl" 
            variant="solid" 
            className="bg-transparent h-full w-full flex-row justify-start pl-6"
            style={{ flex: 1 }}
          >
            <FontAwesome name="envelope" size={22} color="white" />
            <ButtonText className="text-white font-semibold text-lg ml-4 flex-1 text-left">E-posta ile kayıt ol</ButtonText>
          </Button>
        </LinearGradient>
      </Box>

      {/* Login Link */}
      <Box className="flex-row justify-center mt-8">
        <Text className="text-gray-400 text-base">Zaten hesabınız var mı? </Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text className="text-blue-300 font-bold text-base">Giriş yapın</Text>
        </Pressable>
      </Box>
    </VStack>
  );

  const SystemRegisterForm = () => (
    <Animated.View style={{ opacity: fadeAnim }} className="w-full max-w-sm">
      <VStack space="md">
        {/* Back Button and Title */}
        <Box className="flex-row items-center mb-4">
          <Pressable onPress={goBackToOptions} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white">Kayıt Ol</Text>
        </Box>

        {/* Full Name Input */}
        <FormControl>
          <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-14 w-full rounded-2xl">
            <InputSlot className="pl-4">
              <FontAwesome name="user" size={20} color="#cccccc" />
            </InputSlot>
            <InputField
              placeholder="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              className="text-white pl-3 text-base flex-1"
              placeholderTextColor="#999999"
            />
          </Input>
        </FormControl>

        {/* Email Input */}
        <FormControl>
          <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-14 w-full rounded-2xl">
            <InputSlot className="pl-4">
              <FontAwesome name="envelope" size={20} color="#cccccc" />
            </InputSlot>
            <InputField
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="text-white pl-3 text-base flex-1"
              placeholderTextColor="#999999"
            />
          </Input>
        </FormControl>

        {/* Password Input */}
        <FormControl>
          <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-14 w-full rounded-2xl">
            <InputSlot className="pl-4">
              <FontAwesome name="lock" size={20} color="#cccccc" />
            </InputSlot>
            <InputField
              placeholder="Şifre (en az 6 karakter)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="text-white pl-3 text-base flex-1"
              placeholderTextColor="#999999"
            />
            <InputSlot className="pr-4">
              <Pressable onPress={toggleShowPassword}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#cccccc" />
              </Pressable>
            </InputSlot>
          </Input>
        </FormControl>

        {/* Confirm Password Input */}
        <FormControl>
          <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-14 w-full rounded-2xl">
            <InputSlot className="pl-4">
              <FontAwesome name="lock" size={20} color="#cccccc" />
            </InputSlot>
            <InputField
              placeholder="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              className="text-white pl-3 text-base flex-1"
              placeholderTextColor="#999999"
            />
            <InputSlot className="pr-4">
              <Pressable onPress={toggleShowConfirmPassword}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#cccccc" />
              </Pressable>
            </InputSlot>
          </Input>
        </FormControl>

        {/* Register Button */}
        <Box className="mt-6 h-16 rounded-2xl overflow-hidden w-full">
          <LinearGradient
            colors={['#0077be', '#00a3e0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-1"
          >
            <Button 
              onPress={handleRegister} 
              size="xl" 
              variant="solid" 
              className="bg-transparent h-full w-full"
              isDisabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <Spinner color="white" />
              ) : (
                <ButtonText className="text-white font-bold text-lg">Kayıt Ol</ButtonText>
              )}
            </Button>
          </LinearGradient>
        </Box>

        {/* Terms and Privacy */}
        <Text className="text-gray-400 text-sm text-center mt-6 leading-5">
          Kayıt olarak{' '}
          <Text className="text-blue-300">Kullanım Şartları</Text> ve{' '}
          <Text className="text-blue-300">Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
        </Text>
      </VStack>
    </Animated.View>
  );

  return (
    <Box style={styles.container}>
      <LinearGradient
        colors={['#001f3f', '#0077be']}
        style={styles.gradient}
      >
        <Box className="flex-1 justify-center items-center p-6">
          {!showSystemRegister ? <WelcomeScreen /> : <SystemRegisterForm />}
        </Box>
      </LinearGradient>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Register; 
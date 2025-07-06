import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image } from "@/components/ui/image"
import { useAuthStore } from '@/stores';
import { useShowToast } from '@/utils/Toast';

interface WelcomeScreenProps {
  isLoading: boolean;
  onSystemLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  isLoading,
  onSystemLogin,
}) => {
  const { login } = useAuthStore();
  const { showToast } = useShowToast();

  const handleGoogleLogin = async () => {
    try {
      await useAuthStore.getState().googleLogin();
      showToast({
        title: 'Success',
        description: 'Google login successful',
        action: 'success',
      });
      router.replace('/(tabs)');
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Google login failed. Please try again.',
        action: 'error',
      });
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = () => {
    showToast({
      title: 'Info',
      description: 'Apple login will be implemented soon',
      action: 'info',
    });
  };

  return (
    <VStack space="xl" className="w-full justify-center items-center mt-40">
      {/* Brand Logo */}
      <Box className="items-center mb-6">
        <Image
          size="xl"
          source={require('@/assets/images/text-logo.png')}
          className="w-96 h-24 mb-4"
          resizeMode="contain"
        />
        
        <Text className="text-xl font-medium text-center text-gray-300">
          Hesabınıza giriş yapın
        </Text>
      </Box>

      {/* Google Login Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full shadow-sm">
        <Button 
          onPress={handleGoogleLogin} 
          size="xl" 
          variant="outline" 
          className="bg-white h-full w-full border-0 flex-row justify-start pl-6"
          isDisabled={isLoading}
        >
          {isLoading ? (
            <Spinner color="#4285F4" />
          ) : (
            <FontAwesome name="google" size={24} color="#4285F4" />
          )}
          <ButtonText className="text-gray-700 font-semibold text-lg ml-4 flex-1 text-left">
            {isLoading ? 'Giriş yapılıyor...' : 'Google ile devam et'}
          </ButtonText>
        </Button>
      </Box>

      {/* Apple Login Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full  shadow-sm">
        <Button 
          onPress={handleAppleLogin} 
          size="xl" 
          variant="solid" 
          className="bg-black h-full w-full border border-gray-600 flex-row justify-start pl-6"
        >
          <FontAwesome name="apple" size={24} color="white" />
          <ButtonText className="text-white font-semibold text-lg ml-4 flex-1 text-left">Apple ile devam et</ButtonText>
        </Button>
      </Box>

      {/* System Login Button */}
      <Box className="h-16 rounded-2xl overflow-hidden w-full shadow-sm">
        <LinearGradient
          colors={['#0077be', '#00a3e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, height: 64, borderRadius: 16, width: '100%' }}
        >
          <Button 
            onPress={onSystemLogin} 
            size="xl" 
            variant="solid" 
            className="bg-transparent h-full w-full flex-row justify-start pl-6"
            style={{ flex: 1 }}
          >
            <FontAwesome name="envelope" size={22} color="white" />
            <ButtonText className="text-white font-semibold text-lg ml-4 flex-1 text-left">E-posta ile devam et</ButtonText>
          </Button>
        </LinearGradient>
      </Box>

      {/* Sign Up Link */}
      <Box className="flex-row justify-center mt-8">
        <Text className="text-gray-400 text-base">Hesabınız yok mu? </Text>
        <Pressable onPress={() => router.push('/register')}>
          <Text className="text-blue-300 font-bold text-base">Kayıt olun</Text>
        </Pressable>
      </Box>
    </VStack>
  );
}; 
import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import { Spinner } from '@/components/ui/spinner';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useShowToast } from '@/utils/Toast';


export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();
  const showToast = useShowToast();

  const handleLogin = async () => {
    try {
      await login('ahmet.yilmaz@example.com', 'hashed_password');
      showToast({
        title: 'Success',
        description: 'Login successful',
        action: 'success',
      });
      router.replace('/(tabs)');
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Login failed. Please check your credentials.',
        action: 'error',
      });
      console.error('Login error:', error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <Box style={styles.container}>
      <LinearGradient
        colors={['#001f3f', '#0077be']}
        style={styles.gradient}
      >
        <Box className="flex-1 justify-center items-center p-4">
          <Box className="w-full max-w-2xl p-8">
            <VStack space="3xl">
              <MaskedView
                maskElement={
                  <Text className="text-6xl font-bold text-center mb-2">
                    SnapPoint
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#0077be', '#00a3e0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text className="text-6xl font-bold text-center mb-2 opacity-0">
                    SnapPoint
                  </Text>
                </LinearGradient>
              </MaskedView>
              <Text className="text-xl font-medium text-center text-gray-300 mb-8">Connect with friends</Text>
          
              <FormControl>
                <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-20 w-full rounded-3xl">
                  <InputSlot className="pl-4">
                    <FontAwesome name="user" size={24} color="#cccccc" />
                  </InputSlot>
                  <InputField
                    placeholder="Email or phone number"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    className="text-white pl-3 text-lg flex-1"
                    placeholderTextColor="#999999"
                  />
                </Input>
              </FormControl>

              <FormControl>
                <Input size="xl" variant="outline" className="bg-gray-800/50 border-0 h-20 w-full rounded-3xl">
                  <InputSlot className="pl-4">
                    <FontAwesome name="lock" size={24} color="#cccccc" />
                  </InputSlot>
                  <InputField
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="text-white pl-3 text-lg flex-1"
                    placeholderTextColor="#999999"
                  />
                  <InputSlot className="pr-4">
                    <Pressable onPress={toggleShowPassword}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#cccccc" />
                    </Pressable>
                  </InputSlot>
                </Input>
              </FormControl>

              <Box className="mt-6 h-20 rounded-3xl overflow-hidden w-full">
                <LinearGradient
                  colors={['#0077be', '#00a3e0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-1"
                >

                  {/* <Button 
                    onPress={handleLogin} 
                    size="xl" 
                    variant="solid" 
                    action="primary" 
                    className="bg-transparent h-full w-full"
                    isDisabled={isLoading || !isFormValid}
                  > */}
                  <Button 
                    onPress={handleLogin} 
                    size="xl" 
                    variant="solid" 
                    action="primary" 
                    className="bg-transparent h-full w-full"
                    isDisabled={isLoading }
                  >
                    {isLoading ? (
                      <Spinner color="white" />
                    ) : (
                      <ButtonText className="text-white font-bold text-2xl">Sign In</ButtonText>
                    )}
                  </Button>
                </LinearGradient>
              </Box>

              <Box className="flex-row justify-center mt-8">
                <Text className="text-gray-400 text-lg">New to SnapPoint? </Text>
                <Pressable>
                  <Text className="text-blue-300 font-bold text-lg">Sign up now</Text>
                </Pressable>
              </Box>

              <Pressable className="mt-4">
                <Text className="text-gray-400 font-medium text-center text-lg">Need help?</Text>
              </Pressable>
            </VStack>
          </Box>
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

export default Login;

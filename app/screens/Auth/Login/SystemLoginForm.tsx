import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Icon , ArrowLeftIcon, MailIcon, EyeIcon, EyeOffIcon, CheckIcon } from '@/components/ui/icon';
import { useAuthStore } from '@/stores';
import { useVerifyEmail } from '@/api/authApi';
import { useShowToast } from '@/utils/Toast';

interface SystemLoginFormProps {
  fadeAnim: Animated.Value;
  onGoBack: () => void;
}

export const SystemLoginForm: React.FC<SystemLoginFormProps> = ({
  fadeAnim,
  onGoBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login, isLoading } = useAuthStore();
  const { showToast } = useShowToast();
  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
    // Reset email verified status if email changes
    if (emailVerified) {
      setEmailVerified(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleEmailVerification = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    
    verifyEmail(
      { email },
      {
        onSuccess: (data) => {
          if (data.success) {
            setEmailVerified(true);
            setEmailError('');
            showToast({
              description: 'Email verified successfully',
              action: 'success',
            });
          }
        },
        onError: () => {
          // Error handling is done in the hook
        }
      }
    );
  };

  const handleLogin = async () => {
    if (!emailVerified || !password.trim()) return;
    
    try {
      await login(email, password);
      showToast({
        description: 'Login successful',
        action: 'success',
      });
      router.replace('/(tabs)');
    } catch (error) {
      showToast({
        description: 'Login failed. Please check your credentials.',
        action: 'error',
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="w-full">
      <VStack space="xl" className="">
        {/* Header with Back Button */}
        <HStack className="items-center mb-8">
          <Pressable 
            onPress={onGoBack} 
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
          >
            <Icon as={ArrowLeftIcon} size="lg" className="text-white" />
          </Pressable>
        </HStack>

        {/* Title Section */}
        <VStack className="items-center mb-8">
          <Text className="text-3xl font-bold text-white mb-3 text-center">
            {emailVerified ? 'Enter Password' : 'Enter Email'}
          </Text>
          <Text className="text-base text-gray-300 text-center">
            {emailVerified ? 'Enter your password to continue' : 'Enter your email address to verify'}
          </Text>
        </VStack>

        {/* Email Input Section */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-white font-medium text-base mb-2">
              Email Address
            </FormControlLabelText>
          </FormControlLabel>
          <Input
            variant="outline"
            size="xl"
            className={`bg-white/10 border ${
              emailError 
                ? 'border-red-400' 
                : emailVerified 
                ? 'border-green-400' 
                : 'border-white/20'
            } rounded-2xl h-14 px-2`}
          >
            <InputIcon className="ml-2">
              <Icon as={MailIcon} size="md" className="text-gray-400" />
            </InputIcon>
            <InputField
              type="text"
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={handleEmailChange}
              className="text-white text-base ml-2 flex-1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailVerified}
              textContentType="emailAddress"
              blurOnSubmit={false}
            />
            {emailVerified && (
              <Icon as={CheckIcon} size="md" className="text-green-400 mr-4" />
            )}
          </Input>
          {emailError ? (
            <Text className="text-red-400 text-sm mt-2 ml-2">
              {emailError}
            </Text>
          ) : null}
        </FormControl>

        {/* Password Input Section - Only show after email verification */}
        {emailVerified && (
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="text-white font-medium text-base mb-2">
                Password
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="outline"
              size="xl"
              className="bg-white/10 border border-white/20 rounded-2xl h-14 px-2"
            >
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={handlePasswordChange}
                className="text-white text-base ml-4 flex-1"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                blurOnSubmit={false}
              />
              <InputSlot className="pr-3" onPress={toggleShowPassword}>
                <InputIcon
                  as={showPassword ? EyeOffIcon : EyeIcon}
                  size="md"
                  className="text-gray-400"
                />
              </InputSlot>
            </Input>
          </FormControl>
        )}

        <Box className="flex-1" />

        {/* Action Button */}
        <Button
          onPress={emailVerified ? handleLogin : handleEmailVerification}
          size="xl"
          variant="solid"
          action="primary"
          className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25"
          isDisabled={
            emailVerified 
              ? (!password.trim() || isLoading)
              : (!email.trim() || !!emailError || isVerifyingEmail)
          }
        >
          <ButtonText className="text-white font-bold text-lg">
            {emailVerified 
              ? (isLoading ? 'Signing in...' : 'Sign In')
              : (isVerifyingEmail ? 'Verifying...' : 'Continue')
            }
          </ButtonText>
        </Button>
      </VStack>
    </Animated.View>
  );
}; 
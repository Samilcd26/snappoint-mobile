import React, { useState, useCallback, useRef } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Pressable, Animated, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectItem } from "@/components/ui/select";
import { Icon , ArrowLeftIcon, MailIcon, EyeIcon, EyeOffIcon, CheckIcon, AtSignIcon, LockIcon, ChevronDownIcon, AddIcon, DownloadIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import * as ImagePicker from 'expo-image-picker';
import { useRegisterEmailCheck, useRegisterUsernameCheck, useRegister } from '@/api/authApi';
import { uploadAvatarComplete, cleanupTempAvatar } from '@/api/uploadApi';
import { useShowToast } from '@/utils/Toast';

interface RegisterProps {
  fadeAnim?: Animated.Value;
  onGoBack?: () => void;
}

interface EmailStepProps {
  email: string;
  onEmailChange: (value: string) => void;
  onEmailCheck: () => void;
  emailError: string;
  emailVerified: boolean;
  isChecking: boolean;
}

interface UsernameStepProps {
  username: string;
  onUsernameChange: (value: string) => void;
  onUsernameCheck: () => void;
  usernameError: string;
  usernameVerified: boolean;
  isChecking: boolean;
}

interface PasswordStepProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onNext: () => void;
  passwordError: string;
  confirmPasswordError: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

interface PersonalDetailsStepProps {
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onBirthdayChange: (value: string) => void;
  onNext: () => void;
  firstNameError: string;
  lastNameError: string;
}

interface AvatarStepProps {
  avatar: string;
  avatarUri: string;
  onAvatarChange: (value: string) => void;
  onAvatarUriChange: (uri: string) => void;
  onRegister: () => void;
  onSkip: () => void;
  isRegistering: boolean;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

// Step 1: Email Component
const EmailStep = React.memo<EmailStepProps>(({ 
  email, 
  onEmailChange, 
  onEmailCheck, 
  emailError, 
  emailVerified, 
  isChecking 
}) => (
  <VStack space="md">
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
          onChangeText={onEmailChange}
          className="text-white text-base ml-2 flex-1"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!emailVerified}
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={onEmailCheck}
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

    <Button
      onPress={onEmailCheck}
      size="xl"
      variant="solid"
      action="primary"
      className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25 border-2 border-[#2563eb]"
      isDisabled={!email.trim() || !!emailError || isChecking}
    >
      <ButtonText className="text-white font-bold text-lg">
        {isChecking ? 'Checking...' : 'Continue'}
      </ButtonText>
    </Button>
  </VStack>
));

// Step 2: Username Component
const UsernameStep = React.memo<UsernameStepProps>(({ 
  username, 
  onUsernameChange, 
  onUsernameCheck, 
  usernameError, 
  usernameVerified, 
  isChecking 
}) => (
  <VStack space="md">
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Username
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className={`bg-white/10 border ${
          usernameError 
            ? 'border-red-400' 
            : usernameVerified 
            ? 'border-green-400' 
            : 'border-white/20'
        } rounded-2xl h-14 px-2`}
      >
        <InputIcon className="ml-2">
          <Icon as={AtSignIcon} size="md" className="text-gray-400" />
        </InputIcon>
        <InputField
          type="text"
          placeholder="Choose a username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={onUsernameChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!usernameVerified}
          returnKeyType="next"
          onSubmitEditing={onUsernameCheck}
        />
        {usernameVerified && (
          <Icon as={CheckIcon} size="md" className="text-green-400 mr-4" />
        )}
      </Input>
      {usernameError ? (
        <Text className="text-red-400 text-sm mt-2 ml-2">
          {usernameError}
        </Text>
      ) : null}
    </FormControl>

    <Button
      onPress={onUsernameCheck}
      size="xl"
      variant="solid"
      action="primary"
      className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25 border-2 border-[#2563eb]"
      isDisabled={!username.trim() || !!usernameError || isChecking}
    >
      <ButtonText className="text-white font-bold text-lg">
        {isChecking ? 'Checking...' : 'Continue'}
      </ButtonText>
    </Button>
  </VStack>
));

// Step 3: Password Component
const PasswordStep = React.memo<PasswordStepProps>(({ 
  password, 
  confirmPassword, 
  onPasswordChange, 
  onConfirmPasswordChange, 
  onNext, 
  passwordError, 
  confirmPasswordError, 
  showPassword, 
  showConfirmPassword, 
  onTogglePassword, 
  onToggleConfirmPassword 
}) => (
  <VStack space="md">
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Password
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className={`bg-white/10 border ${
          passwordError ? 'border-red-400' : 'border-white/20'
        } rounded-2xl h-14 px-2`}
      >
        <InputIcon className="ml-2">
          <Icon as={LockIcon} size="md" className="text-gray-400" />
        </InputIcon>
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={onPasswordChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="next"
        />
        <InputSlot className="pr-3" onPress={onTogglePassword}>
          <InputIcon
            as={showPassword ? EyeOffIcon : EyeIcon}
            size="md"
            className="text-gray-400"
          />
        </InputSlot>
      </Input>
      {passwordError ? (
        <Text className="text-red-400 text-sm mt-2 ml-2">
          {passwordError}
        </Text>
      ) : null}
    </FormControl>

    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Confirm Password
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className={`bg-white/10 border ${
          confirmPasswordError ? 'border-red-400' : 'border-white/20'
        } rounded-2xl h-14 px-2`}
      >
        <InputIcon className="ml-2">
          <Icon as={LockIcon} size="md" className="text-gray-400" />
        </InputIcon>
        <InputField
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={onNext}
        />
        <InputSlot className="pr-3" onPress={onToggleConfirmPassword}>
          <InputIcon
            as={showConfirmPassword ? EyeOffIcon : EyeIcon}
            size="md"
            className="text-gray-400"
          />
        </InputSlot>
      </Input>
      {confirmPasswordError ? (
        <Text className="text-red-400 text-sm mt-2 ml-2">
          {confirmPasswordError}
        </Text>
      ) : null}
    </FormControl>

    <Button
      onPress={onNext}
      size="xl"
      variant="solid"
      action="primary"
      className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25 border-2 border-[#2563eb]"
      isDisabled={!password.trim() || !confirmPassword.trim() || !!passwordError || !!confirmPasswordError}
    >
      <ButtonText className="text-white font-bold text-lg">
        Continue
      </ButtonText>
    </Button>
  </VStack>
));

// Step 4: Personal Details Component
const PersonalDetailsStep = React.memo<PersonalDetailsStepProps>(({ 
  firstName, 
  lastName, 
  gender, 
  birthday, 
  onFirstNameChange, 
  onLastNameChange, 
  onGenderChange, 
  onBirthdayChange, 
  onNext, 
  firstNameError, 
  lastNameError 
}) => (
  <VStack space="md">
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          First Name
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className={`bg-white/10 border ${
          firstNameError ? 'border-red-400' : 'border-white/20'
        } rounded-2xl h-14 px-2`}
      >
        <InputIcon className="ml-2">
          <Icon as={AtSignIcon} size="md" className="text-gray-400" />
        </InputIcon>
        <InputField
          type="text"
          placeholder="Enter your first name"
          placeholderTextColor="#9CA3AF"
          value={firstName}
          onChangeText={onFirstNameChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
      </Input>
      {firstNameError ? (
        <Text className="text-red-400 text-sm mt-2 ml-2">
          {firstNameError}
        </Text>
      ) : null}
    </FormControl>

    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Last Name
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className={`bg-white/10 border ${
          lastNameError ? 'border-red-400' : 'border-white/20'
        } rounded-2xl h-14 px-2`}
      >
        <InputIcon className="ml-2">
          <Icon as={AtSignIcon} size="md" className="text-gray-400" />
        </InputIcon>
        <InputField
          type="text"
          placeholder="Enter your last name"
          placeholderTextColor="#9CA3AF"
          value={lastName}
          onChangeText={onLastNameChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
      </Input>
      {lastNameError ? (
        <Text className="text-red-400 text-sm mt-2 ml-2">
          {lastNameError}
        </Text>
      ) : null}
    </FormControl>

    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Gender (Optional)
        </FormControlLabelText>
      </FormControlLabel>
      <Select onValueChange={onGenderChange}>
        <SelectTrigger 
          variant="outline" 
          size="xl"
          className="bg-white/10 border border-white/20 rounded-2xl h-14"
        >
          <SelectInput 
            placeholder="Select your gender" 
            className="text-white text-base"
            placeholderTextColor="#9CA3AF"
            value={gender}
          />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-gray-900 border border-gray-700">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectItem label="Male" value="male" className="text-white" />
            <SelectItem label="Female" value="female" className="text-white" />
            <SelectItem label="Non-binary" value="non-binary" className="text-white" />
            <SelectItem label="Other" value="other" className="text-white" />
            <SelectItem label="Prefer not to say" value="prefer-not-to-say" className="text-white" />
          </SelectContent>
        </SelectPortal>
      </Select>
    </FormControl>

    <FormControl>
      <FormControlLabel>
        <FormControlLabelText className="text-white font-medium text-base mb-2">
          Birthday (Optional)
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        variant="outline"
        size="xl"
        className="bg-white/10 border border-white/20 rounded-2xl h-14 px-2"
      >
        <InputField
          type="text"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          value={birthday}
          onChangeText={onBirthdayChange}
          className="text-white text-base ml-2 flex-1"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onNext}
        />
      </Input>
    </FormControl>

    <Button
      onPress={onNext}
      size="xl"
      variant="solid"
      action="primary"
      className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25 border-2 border-[#2563eb]"
      isDisabled={!firstName.trim() || !lastName.trim()}
    >
      <ButtonText className="text-white font-bold text-lg">
        Continue
      </ButtonText>
    </Button>
  </VStack>
));

// Step 5: Avatar Component
const AvatarStep = React.memo<AvatarStepProps>(({ 
  avatar, 
  avatarUri,
  onAvatarChange, 
  onAvatarUriChange,
  onRegister, 
  onSkip, 
  isRegistering,
  isUploading,
  setIsUploading
}) => {
  const { showToast } = useShowToast();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        description: 'Please grant gallery access to select photos',
        action: 'error',
      });
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        description: 'Please grant camera access to take photos',
        action: 'error',
      });
      return false;
    }
    return true;
  };

  const handleImagePicker = () => {
    Alert.alert(
      "Select Profile Photo",
      "Choose how you'd like to add your profile photo",
      [
        {
          text: "Camera",
          onPress: handleCamera,
        },
        {
          text: "Gallery",
          onPress: handleGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onAvatarUriChange(asset.uri);
      await uploadImage(asset);
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onAvatarUriChange(asset.uri);
      await uploadImage(asset);
    }
  };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);
      
      const fileName = `avatar_${Date.now()}.jpg`; // Force JPEG extension
      
      console.log('📤 Starting avatar upload with compression...');
      
      const uploadResult = await uploadAvatarComplete(
        asset.uri,
        fileName
      );

      console.log('✅ Avatar upload completed with compression');

      // Store the temp key for later confirmation during registration
      onAvatarChange(uploadResult.key);
      // Update the preview URL and clear manual avatar input
      onAvatarUriChange(uploadResult.fileUrl);
      showToast({
        description: 'Profile photo compressed and uploaded successfully! 📸',
        action: 'success',
      });
    } catch (error: any) {
      console.error('❌ Avatar upload failed:', error);
      showToast({
        description: error.message || 'Failed to upload image',
        action: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VStack space="md">
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText className="text-white font-medium text-base mb-2">
            Profile Photo (Optional)
          </FormControlLabelText>
        </FormControlLabel>
        
        {/* Image Preview */}
        {avatarUri ? (
          <Box className="items-center mb-4">
            <Image
              source={{ uri: avatarUri }}
              alt="Profile preview"
              className="w-32 h-32 rounded-full border-4 border-white/20"
            />
            <Pressable 
              onPress={handleImagePicker}
              className="mt-2 py-2 px-4 bg-white/10 rounded-lg"
            >
              <Text className="text-white text-sm">Change Photo</Text>
            </Pressable>
          </Box>
        ) : (
          <VStack space="sm">
            {/* Camera Button */}
            <Button
              onPress={handleCamera}
              size="xl"
              variant="outline"
              className="border-2 border-white/20 bg-white/5 rounded-2xl h-16"
              isDisabled={isUploading || isRegistering}
            >
              <HStack space="sm" className="items-center">
                <Icon as={AddIcon} size="lg" className="text-white" />
                <ButtonText className="text-white font-medium text-lg">
                  Take Photo
                </ButtonText>
              </HStack>
            </Button>

            {/* Gallery Button */}
            <Button
              onPress={handleGallery}
              size="xl"
              variant="outline"
              className="border-2 border-white/20 bg-white/5 rounded-2xl h-16"
              isDisabled={isUploading || isRegistering}
            >
              <HStack space="sm" className="items-center">
                <Icon as={DownloadIcon} size="lg" className="text-white" />
                <ButtonText className="text-white font-medium text-lg">
                  Choose from Gallery
                </ButtonText>
              </HStack>
            </Button>

            {/* URL Input */}
            <Text className="text-gray-400 text-center text-sm">or</Text>
            <Input
              variant="outline"
              size="xl"
              className="bg-white/10 border border-white/20 rounded-2xl h-14 px-2"
            >
              <InputField
                type="text"
                placeholder="Paste image URL"
                placeholderTextColor="#9CA3AF"
                value={avatarUri ? '' : avatar}
                onChangeText={(text) => {
                  onAvatarChange(text);
                  if (text && avatarUri) {
                    onAvatarUriChange(''); // Clear uploaded image if manual URL is entered
                  }
                }}
                className="text-white text-base ml-2 flex-1"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                editable={!avatarUri}
              />
            </Input>
          </VStack>
        )}
      </FormControl>

      <Button
        onPress={onRegister}
        size="xl"
        variant="solid"
        action="primary"
        className="bg-blue-600 rounded-3xl h-16 shadow-xl shadow-blue-600/25 border-2 border-[#2563eb]"
        isDisabled={isRegistering || isUploading}
      >
        <ButtonText className="text-white font-bold text-lg">
          {isUploading ? 'Uploading...' : isRegistering ? 'Creating Account...' : 'Create Account'}
        </ButtonText>
      </Button>

      <Button
        onPress={onSkip}
        size="xl"
        variant="outline"
        action="primary"
        className="border-2 border-[#2563eb] bg-transparent rounded-3xl h-16"
        isDisabled={isRegistering || isUploading}
      >
        <ButtonText className="text-blue-600 font-bold text-lg">
          Skip & Create Account
        </ButtonText>
      </Button>
    </VStack>
  );
});

const Register: React.FC<RegisterProps> = React.memo(({
  fadeAnim = new Animated.Value(1),
  onGoBack = () => router.back(),
}) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '',
    birthday: '',
    avatar: '',
    avatarUri: '',
  });
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Validation states
  const [emailVerified, setEmailVerified] = useState(false);
  const [usernameVerified, setUsernameVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  
  // API hooks
  const { showToast } = useShowToast();
  const { mutate: checkEmail, isPending: isCheckingEmail } = useRegisterEmailCheck();
  const { mutate: checkUsername, isPending: isCheckingUsername } = useRegisterUsernameCheck();
  const { mutate: register, isPending: isRegistering } = useRegister();

  // Validation functions
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  }, []);

  const validateUsername = useCallback((username: string) => {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) return 'Username is required';
    if (trimmedUsername.length < 3) return 'Username must be at least 3 characters long';
    if (trimmedUsername.length > 20) return 'Username must be no more than 20 characters long';
    
    // Check if username starts with a letter
    if (!/^[a-zA-Z]/.test(trimmedUsername)) {
      return 'Username must start with a letter';
    }
    
    // Check if username contains only allowed characters
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmedUsername)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    
    // Check for reserved usernames
    const reserved = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'test', 'demo', 'user', 'guest', 'null', 'undefined'];
    if (reserved.includes(trimmedUsername.toLowerCase())) {
      return 'This username is reserved and cannot be used';
    }
    
    return '';
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }, []);

  const validateConfirmPassword = useCallback((password: string, confirmPassword: string) => {
    if (!confirmPassword.trim()) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  }, []);

  // Step navigation
  const handleGoBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onGoBack(); // Exit registration if on first step
    }
  }, [currentStep, onGoBack]);

  // Handler functions
  const handleEmailChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setEmailError(validateEmail(value));
    if (emailVerified) setEmailVerified(false);
  }, [validateEmail, emailVerified]);

  const handleUsernameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    setUsernameError(validateUsername(value));
    if (usernameVerified) setUsernameVerified(false);
  }, [validateUsername, usernameVerified]);

  const handlePasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setPasswordError(validatePassword(value));
    if (formData.confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, formData.confirmPassword));
    }
  }, [validatePassword, validateConfirmPassword, formData.confirmPassword]);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    setConfirmPasswordError(validateConfirmPassword(formData.password, value));
  }, [validateConfirmPassword, formData.password]);

  const handleFirstNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, firstName: value }));
    setFirstNameError(value.trim() ? '' : 'First name is required');
  }, []);

  const handleLastNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, lastName: value }));
    setLastNameError(value.trim() ? '' : 'Last name is required');
  }, []);

  const handleGenderChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  }, []);

  const handleBirthdayChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, birthday: value }));
  }, []);

  const handleAvatarChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, avatar: value }));
  }, []);

  const handleAvatarUriChange = useCallback((uri: string) => {
    setFormData(prev => ({ ...prev, avatarUri: uri }));
  }, []);

  // Password visibility toggles
  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Step navigation
  const handleEmailCheck = useCallback(() => {
    if (!formData.email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    const validationError = validateEmail(formData.email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    
    checkEmail(
      { email: formData.email },
      {
        onSuccess: (data) => {
          if (data.available) {
            setEmailVerified(true);
            setEmailError('');
            setCurrentStep(2);
            showToast({
              description: 'Email is available',
              action: 'success',
            });
          } else {
            setEmailError(data.message || 'Email is already registered');
          }
        },
        onError: (error) => {
          setEmailError(error.response?.data?.error || 'Email check failed');
        }
      }
    );
  }, [formData.email, validateEmail, checkEmail, showToast]);

  const handleUsernameCheck = useCallback(() => {
    if (!formData.username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    
    // First validate client-side
    const validationError = validateUsername(formData.username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }
    
    checkUsername(
      { username: formData.username },
      {
        onSuccess: (data: any) => {
          if (data.available) {
            setUsernameVerified(true);
            setUsernameError('');
            setCurrentStep(3);
            showToast({
              description: 'Username is available',
              action: 'success',
            });
          } else {
            setUsernameError(data.message || 'Username is already taken');
          }
        },
        onError: (error: any) => {
          setUsernameError(error.response?.data?.error || 'Username check failed');
        }
      }
    );
  }, [formData.username, validateUsername, checkUsername, showToast]);

  const handlePasswordNext = useCallback(() => {
    const passwordErr = validatePassword(formData.password);
    const confirmPasswordErr = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);
    
    if (!passwordErr && !confirmPasswordErr) {
      setCurrentStep(4);
    }
  }, [formData.password, formData.confirmPassword, validatePassword, validateConfirmPassword]);

  const handlePersonalDetailsNext = useCallback(() => {
    const firstNameErr = formData.firstName.trim() ? '' : 'First name is required';
    const lastNameErr = formData.lastName.trim() ? '' : 'Last name is required';
    
    setFirstNameError(firstNameErr);
    setLastNameError(lastNameErr);
    
    if (!firstNameErr && !lastNameErr) {
      setCurrentStep(5);
    }
  }, [formData.firstName, formData.lastName]);

  const handleRegister = useCallback((skipAvatar = false) => {
    // Determine if we have a temp avatar upload or manual URL
    const hasAvatarUpload = formData.avatarUri && formData.avatar;
    const hasManualAvatar = formData.avatar && !formData.avatarUri;
    
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender || undefined,
      birthday: formData.birthday || undefined,
      avatar: skipAvatar ? undefined : hasManualAvatar ? formData.avatar : undefined,
      avatarTempKey: skipAvatar ? undefined : hasAvatarUpload ? formData.avatar : undefined,
    };
    
    register(userData, {
      onSuccess: () => {
        showToast({
          description: 'Account created successfully',
          action: 'success',
        });
        router.push('/screens/Auth/Login/Login');
      },
      onError: async (error) => {
        // Cleanup temporary avatar if registration fails
        if (userData.avatarTempKey && !skipAvatar) {
          try {
            await cleanupTempAvatar(userData.avatarTempKey);
          } catch (cleanupError) {
            console.error('Failed to cleanup temporary avatar:', cleanupError);
          }
        }
        
        showToast({
          description: error.response?.data?.error || 'Registration failed',
          action: 'error',
        });
      }
    });
  }, [formData, register, showToast]);

  // Get step info
  const getStepInfo = useCallback(() => {
    switch (currentStep) {
      case 1:
        return { title: 'Enter Email', description: 'Enter your email address to get started' };
      case 2:
        return { title: 'Choose Username', description: 'Pick a unique username' };
      case 3:
        return { title: 'Create Password', description: 'Create a secure password' };
      case 4:
        return { title: 'Personal Information', description: 'Tell us about yourself' };
      case 5:
        return { title: 'Profile Photo', description: 'Add a profile photo (optional)' };
      default:
        return { title: 'Register', description: '' };
    }
  }, [currentStep]);

  const stepInfo = getStepInfo();

  return (
    <Box style={styles.container}>
      <LinearGradient
        colors={['#001f3f', '#0077be']}
        style={styles.gradient}
      >
        <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
          <VStack className="flex-1 px-6 py-8 space-y-6">
            {/* Header with Back Button */}
            <HStack className="items-center justify-between mb-8">
              <Pressable 
                onPress={handleGoBack} 
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <Icon as={ArrowLeftIcon} size="lg" className="text-white" />
              </Pressable>
              <Text className="text-white font-medium">
                Step {currentStep} of 5
              </Text>
              <Box className="w-10" /> {/* Spacer for center alignment */}
            </HStack>

            {/* Title Section */}
            <VStack className="items-center mb-8">
              <Text className="text-3xl font-bold text-white mb-3 text-center">
                {stepInfo.title}
              </Text>
              <Text className="text-base text-gray-300 text-center">
                {stepInfo.description}
              </Text>
            </VStack>

            {/* Progress Indicator */}
            <HStack className="justify-center mb-8">
              {[1, 2, 3, 4, 5].map((step) => (
                <Box
                  key={step}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                />
              ))}
            </HStack>

            {/* Form Content */}
            <Box className="flex-1">
              {currentStep === 1 && (
                <EmailStep
                  email={formData.email}
                  onEmailChange={handleEmailChange}
                  onEmailCheck={handleEmailCheck}
                  emailError={emailError}
                  emailVerified={emailVerified}
                  isChecking={isCheckingEmail}
                />
              )}
              
              {currentStep === 2 && (
                <UsernameStep
                  username={formData.username}
                  onUsernameChange={handleUsernameChange}
                  onUsernameCheck={handleUsernameCheck}
                  usernameError={usernameError}
                  usernameVerified={usernameVerified}
                  isChecking={isCheckingUsername}
                />
              )}
              
              {currentStep === 3 && (
                <PasswordStep
                  password={formData.password}
                  confirmPassword={formData.confirmPassword}
                  onPasswordChange={handlePasswordChange}
                  onConfirmPasswordChange={handleConfirmPasswordChange}
                  onNext={handlePasswordNext}
                  passwordError={passwordError}
                  confirmPasswordError={confirmPasswordError}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  onTogglePassword={handleTogglePassword}
                  onToggleConfirmPassword={handleToggleConfirmPassword}
                />
              )}
              
              {currentStep === 4 && (
                <PersonalDetailsStep
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                  gender={formData.gender}
                  birthday={formData.birthday}
                  onFirstNameChange={handleFirstNameChange}
                  onLastNameChange={handleLastNameChange}
                  onGenderChange={handleGenderChange}
                  onBirthdayChange={handleBirthdayChange}
                  onNext={handlePersonalDetailsNext}
                  firstNameError={firstNameError}
                  lastNameError={lastNameError}
                />
              )}
              
              {currentStep === 5 && (
                <AvatarStep
                  avatar={formData.avatar}
                  avatarUri={formData.avatarUri}
                  onAvatarChange={handleAvatarChange}
                  onAvatarUriChange={handleAvatarUriChange}
                  onRegister={() => handleRegister(false)}
                  onSkip={() => handleRegister(true)}
                  isRegistering={isRegistering}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              )}
            </Box>

            {/* Login Link */}
            <HStack className="justify-center mb-11" space='xs'>
              <Text className="text-gray-300 text-sm">
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push('/screens/Auth/Login/Login')}>
                <Text className="text-blue-400 font-medium text-sm">
                  Sign In
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </Animated.View>
      </LinearGradient>
    </Box>
  );
});

Register.displayName = 'Register';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    width: '100%',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
});

export default Register;
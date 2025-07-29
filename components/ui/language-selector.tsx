import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from '@/utils/useTranslation';

interface LanguageSelectorProps {
  onClose?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onClose }) => {
  const { changeLanguage, currentLanguage } = useTranslation();

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    onClose?.();
  };

  return (
    <View className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-semibold mb-4 text-center">Dil Seçin / Select Language</Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => handleLanguageChange(lang.code)}
          className={`flex-row items-center p-3 rounded-lg mb-2 ${
            currentLanguage === lang.code ? 'bg-blue-100' : 'bg-gray-50'
          }`}
        >
          <Text className="text-2xl mr-3">{lang.flag}</Text>
          <Text className={`text-base ${
            currentLanguage === lang.code ? 'text-blue-600 font-semibold' : 'text-gray-700'
          }`}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 
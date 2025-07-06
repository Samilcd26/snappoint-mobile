import React from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { useShowToast } from './Toast';

// Toast componentini test etmek için örnek component
export const ToastExampleScreen = () => {
  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showToast
  } = useShowToast();

  const handleSuccessToast = () => {
    showSuccessToast(
      'Başarılı!',
      'İşleminiz başarıyla tamamlandı.',
      { duration: 3000 }
    );
  };

  const handleErrorToast = () => {
    showErrorToast(
      'Hata!',
      'Bir şeyler yanlış gitti.',
      { 
        onRetry: () => console.log('Retry clicked!'),
        duration: 5000 
      }
    );
  };

  const handleWarningToast = () => {
    showWarningToast(
      'Uyarı!',
      'Bu işlem geri alınamaz.',
      { placement: 'bottom' }
    );
  };

  const handleInfoToast = () => {
    showInfoToast(
      'Bilgi',
      'Yeni özellikler mevcut.',
      { placement: 'top right' }
    );
  };

  const handleCustomToast = () => {
    showToast({
      title: 'Özel Toast',
      description: 'Bu özel bir toast mesajıdır.',
      action: 'success',
      placement: 'bottom left',
      duration: 2000,
      onRetry: () => console.log('Custom retry!')
    });
  };

  return (
    <View className="flex-1 p-6 justify-center">
      <VStack space="lg" className="items-center">
        <Heading size="xl" className="text-center mb-6">
          Toast Örnekleri
        </Heading>

        <Button onPress={handleSuccessToast} className="w-full" action="positive">
          <ButtonText>Başarı Toast'ı Göster</ButtonText>
        </Button>

        <Button onPress={handleErrorToast} className="w-full" action="negative">
          <ButtonText>Hata Toast'ı Göster</ButtonText>
        </Button>

        <Button onPress={handleWarningToast} className="w-full bg-warning-500">
          <ButtonText>Uyarı Toast'ı Göster</ButtonText>
        </Button>

        <Button onPress={handleInfoToast} className="w-full" action="secondary">
          <ButtonText>Bilgi Toast'ı Göster</ButtonText>
        </Button>

        <Button onPress={handleCustomToast} className="w-full" variant="outline">
          <ButtonText>Özel Toast Göster</ButtonText>
        </Button>
      </VStack>
    </View>
  );
};

// Diğer componentlerde nasıl kullanacağınıza dair örnekler:

/*
// 1. Basit kullanım
const { showSuccessToast } = useShowToast();
showSuccessToast('Başarılı!', 'İşlem tamamlandı.');

// 2. Retry özelliği ile
const { showErrorToast } = useShowToast();
showErrorToast('Hata!', 'Bir şeyler yanlış gitti.', {
  onRetry: () => {
    // Yeniden deneme işlemi
    console.log('Retrying...');
  }
});

// 3. Özel yerleşim ve süre ile
const { showInfoToast } = useShowToast();
showInfoToast('Bilgi', 'Yeni güncelleme mevcut.', {
  placement: 'bottom right',
  duration: 5000
});

// 4. Genel showToast fonksiyonu ile
const { showToast } = useShowToast();
showToast({
  title: 'Özel Toast',
  description: 'Bu özelleştirilmiş bir toast.',
  action: 'warning',
  placement: 'top left',
  duration: 3000,
  onRetry: () => console.log('Custom action')
});
*/ 
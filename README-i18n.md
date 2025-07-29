# i18n (Internationalization) Kurulumu

Projenizde çok dilli destek başarıyla kuruldu. İşte nasıl kullanacağınız:

## Dosya Yapısı

```
mobile/
├── locales/
│   ├── tr/
│   │   └── index.ts     # Türkçe çeviriler
│   └── en/
│       └── index.ts     # İngilizce çeviriler
├── types/
│   └── translations.ts  # TypeScript interface
├── utils/
│   ├── i18n.ts          # i18n konfigürasyonu
│   └── useTranslation.ts # Çeviri hook'u
└── components/
    └── ui/
        └── language-selector.tsx # Dil seçici bileşen
```

## Kullanım

### 1. Çeviri Kullanımı
```tsx
import { useTranslation } from '@/utils/useTranslation';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('welcome')}</Text>
  );
}
```

### 2. Dil Değiştirme
```tsx
import { useTranslation } from '@/utils/useTranslation';

export default function LanguageSettings() {
  const { changeLanguage, currentLanguage } = useTranslation();
  
  return (
    <TouchableOpacity onPress={() => changeLanguage('en')}>
      <Text>Switch to English</Text>
    </TouchableOpacity>
  );
}
```

### 3. Dil Seçici Bileşen
```tsx
import { LanguageSelector } from '@/components/ui/language-selector';

export default function Settings() {
  return (
    <Modal visible={isVisible}>
      <LanguageSelector onClose={() => setIsVisible(false)} />
    </Modal>
  );
}
```

## Çeviri Ekleme

### 1. Önce Type'a Ekle (types/translations.ts)
```ts
export interface TranslationKeys {
  welcome: string;
  newKey: string; // Yeni key'i buraya ekle
  // ...
}
```

### 2. Türkçe (locales/tr/index.ts)
```ts
import { TranslationKeys } from '@/types/translations';

const tr: TranslationKeys = {
  welcome: "Hoş geldiniz",
  newKey: "Yeni metin", // TypeScript kontrol edecek
  // ...
};

export default tr;
```

### 3. İngilizce (locales/en/index.ts)
```ts
import { TranslationKeys } from '@/types/translations';

const en: TranslationKeys = {
  welcome: "Welcome",
  newKey: "New text", // TypeScript kontrol edecek
  // ...
};

export default en;
```

## Özellikler

- 🌍 Otomatik cihaz dili algılama
- 📱 Türkçe ve İngilizce desteği
- 🔄 Dinamik dil değiştirme
- 💾 Dil tercihi otomatik kaydetme
- 🎨 Hazır dil seçici bileşen
- 🔒 **TypeScript Type Safety**
- ✅ **Otomatik tamamlama**
- 🚫 **Eksik key kontrolü**

## TypeScript Avantajları

### ✅ Otomatik Tamamlama
```tsx
const { t } = useTranslation();
t('wel') // VSCode 'welcome' önerecek
```

### 🚫 Eksik Key Koruması
```tsx
t('nonExistentKey') // TypeScript hata verecek
```

### 🔒 Tutarlılık Garantisi
- Her iki dil dosyasında aynı key'ler zorunlu
- Eksik çeviri TypeScript derlemesinde hata verir
- Yeni key ekleme: önce type'a, sonra her iki dile

## Kurulu Paketler

- `react-i18next`: React için i18n kütüphanesi
- `i18next`: Çeviri motoru
- `expo-localization`: Cihaz dili algılama

## Notlar

- Varsayılan dil: Türkçe
- Yedek dil: Türkçe
- Cihaz dili otomatik algılanır
- Desteklenen diller: tr, en 
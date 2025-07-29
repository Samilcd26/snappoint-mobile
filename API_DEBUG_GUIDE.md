# API Çağrıları Debug Rehberi

## Sorun: API İstekleri 2 Kere Ard Arda Atılıyor

### Tespit Edilen Sorunlar ve Çözümler:

#### 1. **React Query Strict Mode Etkisi**
**Sorun:** React 19 ve React Query kombinasyonu development modunda component'leri 2 kere render ediyor.

**Çözüm:** 
- React Query konfigürasyonunda `refetchOnMount: false` ayarı eklendi
- `staleTime` ve `gcTime` değerleri optimize edildi

#### 2. **useAuthCheck Hook'undaki Sonsuz Döngü**
**Sorun:** `authStore.ts` dosyasındaki `useAuthCheck` hook'u her render'da `hydrate()` fonksiyonunu çağırıyordu.

**Çözüm:**
```typescript
// ÖNCE (Yanlış)
useEffect(() => {
  if (!isLoggedIn) {
    hydrate();
  }
}, [isLoggedIn, hydrate]); // hydrate dependency'si değişiyor

// SONRA (Doğru)
useEffect(() => {
  hydrate();
}, []); // Dependency array'i boş bırak
```

#### 3. **Splash Screen'de Çoklu API Çağrıları**
**Sorun:** Splash screen'de `useGetUserInfo` hook'u birden fazla kez tetikleniyordu.

**Çözüm:**
- Auth check logic'i optimize edildi
- `authCheckComplete.current` flag'i ile tekrar çağrıları engellendi

#### 4. **_layout.tsx'te Hydrate Çağrısı**
**Sorun:** Root layout'ta `hydrate()` fonksiyonu dependency array'de `hydrate` fonksiyonu olduğu için sürekli çağrılıyordu.

**Çözüm:**
```typescript
// ÖNCE (Yanlış)
useEffect(() => {
  hydrate();
}, [hydrate]);

// SONRA (Doğru)
useEffect(() => {
  hydrate();
}, []); // Sadece bir kere çalıştır
```

### Debug Araçları

#### 1. **DebugLogger Kullanımı**
Tüm API çağrılarını izlemek için `DebugLogger` eklendi:

```typescript
// Console'da API çağrılarını görmek için
debugLogger.printSummary();

// Logları temizlemek için
debugLogger.clearLogs();

// Tüm logları görmek için
debugLogger.getLogs();
```

#### 2. **Development Console Komutları**
Metro bundler console'unda şu komutları kullanabilirsiniz:

```javascript
// Global olarak erişilebilir debug logger
debugLogger.printSummary();
debugLogger.clearLogs();
```

### React Query Optimizasyonları

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      gcTime: 1000 * 60 * 10, // 10 dakika
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});
```

### Önemli Notlar

1. **Development vs Production:** Bu sorunlar çoğunlukla development modunda görülür. Production build'de React Strict Mode devre dışıdır.

2. **React Query Cache:** Query'ler artık daha uzun süre cache'de kalır ve gereksiz API çağrıları azaltılır.

3. **Auth State Management:** Zustand store'da auth state yönetimi optimize edildi.

### Test Etme

1. Uygulamayı restart edin
2. Metro bundler console'unu açın
3. `debugLogger.printSummary()` komutunu çalıştırın
4. API çağrılarının tekrarlanıp tekrarlanmadığını kontrol edin

### Gelecekteki Sorunları Önleme

1. **useEffect Dependency Arrays:** Her zaman dikkatli olun
2. **React Query Hooks:** `enabled` parametresini doğru kullanın
3. **State Management:** Gereksiz re-render'ları önleyin
4. **Debug Logging:** Şüpheli durumlarda debug logger kullanın

### İletişim

Sorun devam ederse:
1. `debugLogger.getLogs()` çıktısını paylaşın
2. Console log'larını kontrol edin
3. Network tab'ında duplicate request'leri arayın

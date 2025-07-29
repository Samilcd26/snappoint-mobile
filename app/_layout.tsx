import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen as ExpoSplashScreen, Stack, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from "@/stores";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { renderScreens } from "@/config/screenConfig";

import "../global.css";
import "@/utils/i18n";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000 , // 5 dakika
      gcTime: 5000 , // 10 dakika
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore(state => state.hydrate);

  // Hydrate auth store from AsyncStorage when app starts - sadece bir kere
  useEffect(() => {
    hydrate();
  }, []); // Dependency array'i boş bırak

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                {renderScreens()}
              </Stack>
            </ThemeProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

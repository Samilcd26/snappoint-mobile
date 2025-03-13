import React from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import DiscoveryScreen from './discovery';
import '../global.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <View className="flex-1 bg-gray-900">
            <DiscoveryScreen />
          </View>
        </PortalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

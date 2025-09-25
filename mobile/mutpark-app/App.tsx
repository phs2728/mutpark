import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppNavigator } from '@/navigation/AppNavigator';
import { NotificationProvider } from '@/services/NotificationService';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NotificationProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </NotificationProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
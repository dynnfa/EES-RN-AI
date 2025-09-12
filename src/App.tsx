import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;

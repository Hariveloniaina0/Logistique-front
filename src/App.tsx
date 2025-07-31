// src/index.tsx
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { GlobalProvider } from './context/GlobalContext';
import App from 'App';

const Root = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent('Logitrack', () => Root);
import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'src/store';
import { GlobalProvider } from 'src/context/GlobalContext';
import { AppNavigator } from 'src/navigation/AppNavigator';

import './global.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GlobalProvider>
        <AppNavigator />
      </GlobalProvider>
    </Provider>
  );
};

export default App;
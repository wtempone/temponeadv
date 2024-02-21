import { Loader, MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '~/components/contexts/UserContext';
import Main from '~/components/root/Main';
import { UserDataProvider } from '../contexts/UserDataContext';
import { CssLoader } from '../shared/LoaderMain';
import './App.css';
import { BrowserRouter } from 'react-router-dom';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'my-app-color-scheme',
});

export const App = () => {

  return (
      <MantineProvider
        theme={{
          components: {
            Loader: Loader.extend({
              defaultProps: {
                loaders: { ...Loader.defaultLoaders, custom: CssLoader },
                type: 'custom',
              },
            }),
          },
        }}
      >
        <DatesProvider settings={{ locale: 'pt-br' }}>
            <Notifications />
            <HelmetProvider>
              <AuthProvider>
                <UserDataProvider>
                  <Main />
                </UserDataProvider>
              </AuthProvider>
            </HelmetProvider>
        </DatesProvider>
      </MantineProvider>
  );
};

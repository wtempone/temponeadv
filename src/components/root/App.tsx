import { Loader, MantineProvider, VariantColorsResolver, darken, defaultVariantColorsResolver, localStorageColorSchemeManager, parseThemeColor, rem, rgba } from '@mantine/core';
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

  const variantColorResolver: VariantColorsResolver = (input) => {
    const defaultResolvedColors = defaultVariantColorsResolver(input);
    const parsedColor = parseThemeColor({
      color: input.color || input.theme.primaryColor,
      theme: input.theme,
    });
  
    if (parsedColor.isThemeColor && parsedColor.color === 'lime' && input.variant === 'filled') {
      return {
        ...defaultResolvedColors,
        color: 'var(--mantine-color-black)',
        hoverColor: 'var(--mantine-color-black)',
      };
    }
  
    if (input.variant === 'light') {
      return {
        background: rgba(parsedColor.value, 0.1),
        hover: rgba(parsedColor.value, 0.15),
        border: `${rem(1)} solid ${parsedColor.value}`,
        color: darken(parsedColor.value, 0.1),
      };
    }
  
    if (input.variant === 'danger') {
      return {
        background: 'var(--mantine-color-red-9)',
        hover: 'var(--mantine-color-red-8)',
        color: 'var(--mantine-color-white)',
        border: 'none',
      };
    }
  
    return defaultResolvedColors;
  };
  
  return (
      <MantineProvider
        theme={{
          variantColorResolver:variantColorResolver,
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

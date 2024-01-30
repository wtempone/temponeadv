import { App } from "~/components/root/App";
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css';

import { Loader, MantineProvider } from '@mantine/core';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import 'dayjs/locale/pt-br';
import '@mantine/notifications/styles.css';

import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from "@mantine/modals";
import { CssLoader } from "./components/shared/LoaderMain";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
      <ModalsProvider>
        <DatesProvider settings={{ locale: 'pt-br' }}>
          <Notifications />
          <App />
        </DatesProvider>
        /</ModalsProvider>
    </MantineProvider>
  </React.StrictMode>,
);

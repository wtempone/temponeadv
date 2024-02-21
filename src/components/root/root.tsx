import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from "~/components/root/App";
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);

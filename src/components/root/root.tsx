import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '~/components/root/App';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { JulianDate, Timeline } from 'cesium';
import { setupFirebase } from '~/lib/firebase';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
(Timeline.prototype as any).makeLabel = (time: JulianDate) => {
  const localDate = JulianDate.toDate(time);
  return localDate.toTimeString().substring(0, 5);
};

setupFirebase()
  .then(() => {
    console.log('Firebase initialized');
  })
  .catch((error) => {
    console.error('Error initializing Firebase:', error);
  })
  .finally(() => {
    console.log('App initialization complete');
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });

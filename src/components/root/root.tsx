import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from "~/components/root/App";
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import  utc  from 'dayjs/plugin/utc';
import  timezone   from 'dayjs/plugin/timezone';
import { JulianDate, Timeline } from 'cesium';

(Timeline.prototype as any).makeLabel = (time: JulianDate) => {
  const localDate = JulianDate.toDate(time);
  return localDate.toTimeString().substring(0, 5);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);

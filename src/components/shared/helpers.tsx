import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br')
function tsFBToDate(dateObject: any): Date | null {
  if (typeof dateObject == 'object') return (dateObject as Object as Timestamp).toDate();
  else return null;
}
function DateFormated(date: Date): string {
  return dayjs(date).format('DD/MM/YYYY');
}
function TimeFormated(date: Date): string {
  return dayjs(date).format('HH:mm');
}
function DateCompact(date: Date): string {
  return dayjs(date).format('YYYYMMDD');
}
function DateTimeFormated(dateObject: any) {
  const data = dayjs((dateObject as Object as Timestamp).toDate());
  return dayjs(data).format('DD/MM/YYYY HH:mm:ss');
}
function tsToTime(dateObject: number) {
  const data = new Date(dateObject);
  return dayjs(data).format('HH:mm:ss');
}
function fullNamedDateString(data: Date) {
  return dayjs(data).format('D [de] MMMM [de] YYYY');
}
function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}
function millisecondsToTime(milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h : ${padTo2Digits(minutes)} min`;
}
function stringToDate(dataString: string): Date | null {
  if (dataString.length !== 8) {
    console.error('Formato de string inválido. Deve ter 8 caracteres (YYYYMMDD).');
    return null;
  }
  const ano = parseInt(dataString.substring(0, 4), 10);
  const mes = parseInt(dataString.substring(4, 6), 10) - 1;
  const dia = parseInt(dataString.substring(6, 8), 10);

  const data = new Date(ano, mes, dia);

  if (isNaN(data.getTime())) {
    console.error('Data inválida.');
    return null;
  }
  return data;
}

function getDayDates(date: Date): { startDate: Date; endDate: Date } {
  const clonedDate = new Date(date);
  clonedDate.setHours(0, 0, 0, 0);
  const startDate = new Date(clonedDate);
  clonedDate.setHours(23, 59, 59, 999);
  const endDate = new Date(clonedDate);
  return { startDate, endDate };
}
export {
  tsFBToDate,
  DateFormated,
  DateTimeFormated,
  tsToTime,
  fullNamedDateString,
  DateCompact,
  millisecondsToTime,
  stringToDate,
  TimeFormated,
  getDayDates
};

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.locale('ru');
dayjs.extend(relativeTime);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
    value,
  );

export const formatDate = (value: string | number | Date, withTime = false) =>
  dayjs(value).format(withTime ? 'D MMM YYYY, HH:mm' : 'D MMM YYYY');

export const formatRelative = (value: string | number | Date) => dayjs(value).fromNow();


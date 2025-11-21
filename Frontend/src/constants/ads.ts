import type { ModerationStatus, Priority } from '@/types/ads';

export const STATUS_OPTIONS: Array<{ value: ModerationStatus; label: string }> = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'draft', label: 'На доработке' },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  normal: 'Обычный',
  urgent: 'Срочный',
};

export const CATEGORY_OPTIONS = [
  { value: 0, label: 'Электроника' },
  { value: 1, label: 'Недвижимость' },
  { value: 2, label: 'Транспорт' },
  { value: 3, label: 'Работа' },
  { value: 4, label: 'Услуги' },
  { value: 5, label: 'Животные' },
  { value: 6, label: 'Мода' },
  { value: 7, label: 'Детское' },
];

export const REJECTION_TEMPLATES = [
  'Запрещённый товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое',
];


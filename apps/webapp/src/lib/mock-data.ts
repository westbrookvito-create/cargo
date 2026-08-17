import type {
  FaqItem,
  ShipmentItem,
  TariffRate,
  UserProfile,
  WarehouseAddress,
} from '../types'

export const mockUser: UserProfile = {
  id: 'u_1',
  telegramId: 482910773,
  firstName: 'Виктор',
  lastName: 'Забродин',
  username: 'vzabrodin',
  photoUrl: undefined,
  phone: '+7 999 123-45-67',
  balanceUsd: 42.3,
  personalCode: 'CC-8841',
  referralCode: 'VZ8841',
  activeShipments: 3,
  totalShipments: 27,
  totalWeightKg: 186.4,
  memberSince: '2023-11-02',
  language: 'ru',
  notificationsEnabled: true,
}

export const warehouses: WarehouseAddress[] = [
  {
    id: 'wh_gz',
    city: 'Guangzhou',
    cityRu: 'Гуанчжоу',
    country: 'Китай',
    addressLines: [
      '广东省广州市白云区',
      '均禾街道均和大道 18 号',
      'CrispyCargo 仓库 3',
    ],
    personalCode: 'CC-8841',
    isDefault: true,
  },
  {
    id: 'wh_yw',
    city: 'Yiwu',
    cityRu: 'Иу',
    country: 'Китай',
    addressLines: [
      '浙江省义乌市福田街道',
      '国际商贸城物流园区 B 区 12 号',
      'CrispyCargo 仓库 Yiwu-2',
    ],
    personalCode: 'CC-8841',
    isDefault: false,
  },
]

export const tariffs: TariffRate[] = [
  {
    method: 'express',
    title: 'Express',
    subtitle: 'Дверь-дверь, самый быстрый',
    pricePerKgUsd: 9.9,
    minDays: 4,
    maxDays: 7,
    minWeightKg: 0.5,
  },
  {
    method: 'avia',
    title: 'Авиа',
    subtitle: 'Оптимальный баланс цены и скорости',
    pricePerKgUsd: 6.4,
    minDays: 8,
    maxDays: 14,
    minWeightKg: 1,
  },
  {
    method: 'auto',
    title: 'Авто',
    subtitle: 'Самый выгодный тариф',
    pricePerKgUsd: 3.8,
    minDays: 18,
    maxDays: 25,
    minWeightKg: 3,
  },
]

const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString()
const daysFromNow = (d: number) => new Date(now + d * 86400000).toISOString()

export const mockShipments: ShipmentItem[] = [
  {
    id: 's_1',
    trackNumber: 'CC2508170231',
    cnTrackNumber: 'SF7739284611CN',
    title: 'Наушники TWS + чехлы для телефона',
    storeName: 'Taobao — TechZone Store',
    category: 'electronics',
    status: 'in_transit',
    deliveryMethod: 'avia',
    weightKg: 1.8,
    volumeM3: 0.006,
    declaredValueUsd: 64,
    costUsd: 11.52,
    paid: true,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
    etaDate: daysFromNow(4),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', location: 'Гуанчжоу', timestamp: daysAgo(9) },
      { id: 'e2', status: 'in_warehouse_cn', title: 'Посылка принята на складе', description: 'Проверен вес и вложение', location: 'Гуанчжоу, склад 3', timestamp: daysAgo(8) },
      { id: 'e3', status: 'packed', title: 'Упаковано в сборный груз', location: 'Гуанчжоу, склад 3', timestamp: daysAgo(6) },
      { id: 'e4', status: 'in_transit', title: 'Груз вылетел рейсом CA967', location: 'Гуанчжоу → Москва', timestamp: daysAgo(1) },
    ],
  },
  {
    id: 's_2',
    trackNumber: 'CC2508140187',
    cnTrackNumber: 'YT6602841173CN',
    title: 'Кроссовки New Balance 2 пары',
    storeName: 'Poizon',
    category: 'shoes',
    status: 'customs',
    deliveryMethod: 'auto',
    weightKg: 3.4,
    volumeM3: 0.021,
    declaredValueUsd: 140,
    costUsd: 12.92,
    paid: true,
    createdAt: daysAgo(19),
    updatedAt: daysAgo(0),
    etaDate: daysFromNow(6),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', location: 'Иу', timestamp: daysAgo(19) },
      { id: 'e2', status: 'in_warehouse_cn', title: 'Посылка принята на складе', location: 'Иу, склад 2', timestamp: daysAgo(17) },
      { id: 'e3', status: 'packed', title: 'Упаковано в сборный груз', location: 'Иу, склад 2', timestamp: daysAgo(14) },
      { id: 'e4', status: 'in_transit', title: 'Груз отправлен автотранспортом', location: 'Иу → Алматы', timestamp: daysAgo(9) },
      { id: 'e5', status: 'customs', title: 'Таможенное оформление', description: 'Ожидает выпуска на таможне ЕАЭС', location: 'Алматы', timestamp: daysAgo(0) },
    ],
  },
  {
    id: 's_3',
    trackNumber: 'CC2508090052',
    cnTrackNumber: 'JT5591038824CN',
    title: 'Пуховик зимний + свитеры (3 шт)',
    storeName: '1688.com',
    category: 'clothes',
    status: 'in_warehouse_local',
    deliveryMethod: 'avia',
    weightKg: 2.6,
    volumeM3: 0.014,
    declaredValueUsd: 95,
    costUsd: 16.64,
    paid: true,
    createdAt: daysAgo(24),
    updatedAt: daysAgo(1),
    etaDate: daysFromNow(1),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', location: 'Гуанчжоу', timestamp: daysAgo(24) },
      { id: 'e2', status: 'in_warehouse_cn', title: 'Посылка принята на складе', location: 'Гуанчжоу, склад 3', timestamp: daysAgo(22) },
      { id: 'e3', status: 'packed', title: 'Упаковано в сборный груз', location: 'Гуанчжоу, склад 3', timestamp: daysAgo(19) },
      { id: 'e4', status: 'in_transit', title: 'Груз вылетел рейсом CA341', location: 'Гуанчжоу → Москва', timestamp: daysAgo(12) },
      { id: 'e5', status: 'customs', title: 'Таможенное оформление завершено', location: 'Москва, Шереметьево', timestamp: daysAgo(3) },
      { id: 'e6', status: 'in_warehouse_local', title: 'Прибыло на локальный склад', description: 'Готово к выдаче или доставке курьером', location: 'Москва, ПВЗ Тёплый Стан', timestamp: daysAgo(1) },
    ],
  },
  {
    id: 's_4',
    trackNumber: 'CC2507220098',
    cnTrackNumber: 'ZT4471029385CN',
    title: 'Механическая клавиатура + мышь',
    storeName: 'Taobao — GamerHub',
    category: 'electronics',
    status: 'delivered',
    deliveryMethod: 'express',
    weightKg: 1.4,
    volumeM3: 0.009,
    declaredValueUsd: 78,
    costUsd: 13.86,
    paid: true,
    createdAt: daysAgo(41),
    updatedAt: daysAgo(30),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', location: 'Гуанчжоу', timestamp: daysAgo(41) },
      { id: 'e2', status: 'in_warehouse_cn', title: 'Посылка принята на складе', location: 'Гуанчжоу, склад 3', timestamp: daysAgo(40) },
      { id: 'e3', status: 'in_transit', title: 'Экспресс-доставка курьером', location: 'Гуанчжоу → Москва', timestamp: daysAgo(37) },
      { id: 'e4', status: 'in_warehouse_local', title: 'Прибыло на локальный склад', location: 'Москва', timestamp: daysAgo(32) },
      { id: 'e5', status: 'delivered', title: 'Посылка вручена получателю', location: 'Москва, курьер', timestamp: daysAgo(30) },
    ],
  },
  {
    id: 's_5',
    trackNumber: 'CC2508160299',
    cnTrackNumber: 'STO8827461950CN',
    title: 'Косметика и уходовые средства',
    storeName: 'Taobao — Beauty Lab',
    category: 'liquid',
    status: 'awaiting_arrival',
    deliveryMethod: 'avia',
    weightKg: undefined,
    declaredValueUsd: 38,
    paid: false,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', description: 'Ожидаем поступление на склад в Гуанчжоу', location: 'Гуанчжоу', timestamp: daysAgo(1) },
    ],
  },
  {
    id: 's_6',
    trackNumber: 'CC2507150061',
    cnTrackNumber: 'YT2210495736CN',
    title: 'Powerbank 20000mAh — партия 4 шт',
    storeName: '1688.com',
    category: 'battery',
    status: 'issue',
    deliveryMethod: 'auto',
    weightKg: 2.1,
    volumeM3: 0.008,
    declaredValueUsd: 56,
    costUsd: 7.98,
    paid: true,
    createdAt: daysAgo(33),
    updatedAt: daysAgo(2),
    events: [
      { id: 'e1', status: 'awaiting_arrival', title: 'Заказ принят в обработку', location: 'Иу', timestamp: daysAgo(33) },
      { id: 'e2', status: 'in_warehouse_cn', title: 'Посылка принята на складе', location: 'Иу, склад 2', timestamp: daysAgo(31) },
      { id: 'e3', status: 'issue', title: 'Требуется декларация на батарею', description: 'Пришлите фото маркировки Wh для оформления перевозки опасного груза', location: 'Иу, склад 2', timestamp: daysAgo(2) },
    ],
  },
]

export const faqItems: FaqItem[] = [
  {
    id: 'f1',
    question: 'Как получить адрес склада в Китае?',
    answer:
      'Откройте раздел «Мой адрес» в приложении — там указан полный адрес склада и ваш персональный код. Обязательно указывайте персональный код в поле "получатель" при заказе на Taobao, 1688 и Poizon — по нему мы определяем, что посылка ваша.',
  },
  {
    id: 'f2',
    question: 'Сколько стоит доставка?',
    answer:
      'Стоимость зависит от тарифа: Express от $9.9/кг (4-7 дней), Авиа от $6.4/кг (8-14 дней), Авто от $3.8/кг (18-25 дней). Точную стоимость можно рассчитать в разделе «Калькулятор» с учётом категории товара.',
  },
  {
    id: 'f3',
    question: 'Можно ли объединить несколько посылок в одну?',
    answer:
      'Да, это называется консолидация. Все посылки, которые пришли на склад в течение 20 дней, можно объединить в один сборный груз бесплатно — это существенно снижает стоимость доставки за счёт логистики.',
  },
  {
    id: 'f4',
    question: 'Что нельзя отправлять?',
    answer:
      'Запрещены: жидкости свыше 1 литра без декларации, аккумуляторы без маркировки Wh, оружие, легковоспламеняющиеся вещества, продукты питания животного происхождения. Полный список — в разделе поддержки.',
  },
  {
    id: 'f5',
    question: 'Как оплатить доставку?',
    answer:
      'После взвешивания на складе вы получаете точный расчёт стоимости в приложении. Оплата картой, СБП или с баланса личного кабинета. Посылка отправляется в путь сразу после оплаты.',
  },
]

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`
}

export function statusLabel(status: ShipmentItem['status']): string {
  const map: Record<ShipmentItem['status'], string> = {
    awaiting_arrival: 'Ожидает поступления',
    in_warehouse_cn: 'На складе в Китае',
    packed: 'Упаковано',
    in_transit: 'В пути',
    customs: 'На таможне',
    in_warehouse_local: 'На локальном складе',
    delivered: 'Доставлено',
    issue: 'Требует внимания',
  }
  return map[status]
}

const MONTHS_GENITIVE_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export function formatMonthYearRu(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_GENITIVE_RU[d.getMonth()]} ${d.getFullYear()}`
}

export function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function categoryLabel(category: ShipmentItem['category']): string {
  const map: Record<ShipmentItem['category'], string> = {
    general: 'Обычный товар',
    clothes: 'Одежда',
    shoes: 'Обувь',
    electronics: 'Электроника',
    accessories: 'Аксессуары',
    battery: 'С аккумулятором',
    liquid: 'Жидкость / крем',
    branded: 'Брендовая вещь',
  }
  return map[category]
}

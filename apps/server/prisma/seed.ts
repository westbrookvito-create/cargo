import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.warehouse.deleteMany()
  await prisma.tariff.deleteMany()

  await prisma.warehouse.createMany({
    data: [
      {
        city: 'Guangzhou',
        cityRu: 'Гуанчжоу',
        country: 'Китай',
        addressLines: JSON.stringify([
          '广东省广州市白云区',
          '均禾街道均和大道 18 号',
          'CrispyCargo 仓库 3',
        ]),
        isDefault: true,
      },
      {
        city: 'Yiwu',
        cityRu: 'Иу',
        country: 'Китай',
        addressLines: JSON.stringify([
          '浙江省义乌市福田街道',
          '国际商贸城物流园区 B 区 12 号',
          'CrispyCargo 仓库 Yiwu-2',
        ]),
        isDefault: false,
      },
    ],
  })

  await prisma.tariff.createMany({
    data: [
      { method: 'EXPRESS', title: 'Express', subtitle: 'Дверь-дверь, самый быстрый', pricePerKgUsd: 9.9, minDays: 4, maxDays: 7, minWeightKg: 0.5 },
      { method: 'AVIA', title: 'Авиа', subtitle: 'Оптимальный баланс цены и скорости', pricePerKgUsd: 6.4, minDays: 8, maxDays: 14, minWeightKg: 1 },
      { method: 'AUTO', title: 'Авто', subtitle: 'Самый выгодный тариф', pricePerKgUsd: 3.8, minDays: 18, maxDays: 25, minWeightKg: 3 },
    ],
  })

  console.log('Seeded warehouses & tariffs.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import cron from 'node-cron';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { PriceHistory } from '../models/PriceHistory.js';
import { LocalNotification } from '../models/Notification.js';
import { sendPriceNotification } from './telegramService.js';
import { parseWbItem } from './wbService.js';

export const initCronTasks = () => {
    // '0 * * * *' - каждый час
    cron.schedule('*/2 * * * *', async () => {
        const globalStartTime = performance.now();
        console.log('--- Запуск фонового обновления цен ---');

        try {
            let itemsToProcess = await Item.findAll();
            let attempt = 1;
            const MAX_ATTEMPTS = 3;

            while (itemsToProcess.length > 0 && attempt <= MAX_ATTEMPTS) {
                if (attempt > 1) {
                    console.log(`--- Повторная попытка ${attempt} для ${itemsToProcess.length} товаров ---`);
                    await new Promise(res => setTimeout(res, 10000));
                }

                const failedItems: any[] = [];

                for (const item of itemsToProcess) {
                    const itemStartTime = performance.now();
                    try {
                        console.log(`[Попытка ${attempt}] Обновление: ${item.article}`);

                        const freshData = await parseWbItem(item.article.toString());

                        const updatePayload: any = {
                            currentPrice: freshData.currentPrice,
                            oldPrice: freshData.oldPrice,
                            name: freshData.name
                        };

                        if (freshData.currentPrice !== item.currentPrice) {
                            await PriceHistory.create({
                                itemId: item.id,
                                price: freshData.currentPrice,
                                createdAt: new Date()
                            });
                            updatePayload.lastPriceChange = new Date();
                        }

                        if (item.targetPrice && freshData.currentPrice <= item.targetPrice) {
                            if (item.lastNotifiedPrice === null || freshData.currentPrice < item.lastNotifiedPrice) {
                                console.log(`Цена на "${item.name}" упала до ${freshData.currentPrice} ₽ (Цель: ${item.targetPrice} ₽)`);

                                const tgMessage = `
🔔  <b>Снижение цены!</b>
         <b>Товар:</b> ${item.name}
         <b>Новая цена:</b> ${freshData.currentPrice} ₽
         <b>Ваш порог:</b> ${item.targetPrice} ₽
         <a href="https://www.wildberries.ru/catalog/${item.article}/detail.aspx">Перейти к товару</a>`;

                                const localMessage = `🔔 Снижение цены!
      Товар: ${item.name}
      Новая цена: ${freshData.currentPrice} ₽
      Ваш порог: ${item.targetPrice} ₽`;

                                // 1. Локальное уведомление
                                await LocalNotification.create({
                                    userId: item.userId,
                                    message: localMessage,
                                    productId: item.id,
                                    isRead: false
                                });

                                // 2. Уведомление в тг
                                const user = await User.findByPk(item.userId);
                                if (user?.telegramId) {
                                    await sendPriceNotification(user.telegramId, tgMessage);
                                }

                                updatePayload.lastNotifiedPrice = freshData.currentPrice;
                                console.log(`🔔 Уведомление отправлено для ${item.article}`);
                            }
                        }

                        await item.update(updatePayload);

                        const itemDuration = ((performance.now() - itemStartTime) / 1000).toFixed(2);
                        console.log(`[⏱] Товар ${item.article} обновлен за ${itemDuration} сек.`);

                        await new Promise(res => setTimeout(res, 5000));

                    } catch (itemError: any) {
                        const itemEndTime = performance.now();
                        const itemDuration = ((itemEndTime - itemStartTime) / 1000).toFixed(2);
                        console.error(`[⏱] Ошибка обхода ${item.article} после ${itemDuration} сек: ${itemError.message}`);
                        failedItems.push(item);
                    }
                }
                itemsToProcess = failedItems;
                attempt++;
            }

            if (itemsToProcess.length > 0) {
                console.error(`Не удалось обновить ${itemsToProcess.length} товаров после ${MAX_ATTEMPTS} попыток.`);
            }

        } catch (error) {
            console.error('Критическая ошибка в крон-задаче:', error);
        }

        const globalEndTime = performance.now();
        const totalDuration = ((globalEndTime - globalStartTime) / 1000).toFixed(2);
        console.log(`--- Цикл обновления завершён за ${totalDuration} сек ---`);
    });
};
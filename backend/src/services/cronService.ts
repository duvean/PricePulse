import cron from 'node-cron';
import { Item } from '../models/Item.js';
import { parseWbItem } from './wbService.js';

export const initCronTasks = () => {
    // '0 * * * *'    Запуск каждый час
    // '*/1 * * * *'  Для отладки раз в минуту
    cron.schedule('*/1 * * * *', async () => {
        console.log('--- Запуск фонового обновления цен ---');
        
        try {
            const items = await Item.findAll();

            for (const item of items) {
                try {
                    console.log(`Обновление товара: ${item.article}`);
                    
                    const freshData = await parseWbItem(item.article.toString());

                    if (item.targetPrice && freshData.currentPrice <= item.targetPrice) {
                        console.log(`!!! АХТУНГЪ !!!`);
                        console.log(`Цена на "${item.name}" упала до ${freshData.currentPrice} ₽!`);
                        console.log(`Порог пользователя: ${item.targetPrice} ₽`);
                        console.log(`Ссылка: https://www.wildberries.ru/catalog/${item.article}/detail.aspx`);
                    }

                    await item.update({
                        currentPrice: freshData.currentPrice,
                        oldPrice: freshData.oldPrice,
                        name: freshData.name
                    });
                    await new Promise(res => setTimeout(res, 5000));

                } catch (itemError) {
                    if (itemError instanceof Error) {
                        console.error(`Ошибка обновления товара ${item.article}:`, itemError.message);
                    } else {
                        console.error(`Неопознанный пиздец при обновлении товара ${item.article}`);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка в крон-задаче:', error);
        }
        
        console.log('--- Обновление цен завершено ---');
    });
};
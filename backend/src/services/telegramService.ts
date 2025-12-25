import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { Telegraf } from 'telegraf';
import { User } from '../models/User.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

async function downloadAvatar(url: string, userId: number): Promise<string> {
    const fileName = `avatar_${userId}_${Date.now()}.jpg`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on('finish', () => resolve(`/uploads/${fileName}`));
        writer.on('error', reject);
    });
}

bot.start(async (ctx) => {
    const userId = ctx.payload;
    if (!userId) return ctx.reply('Используйте ссылку из личного кабинета.');

    try {
        const user = await User.findByPk(userId);
        if (!user) return ctx.reply('Пользователь не найден.');

        const firstName = ctx.from.first_name || "";
        const lastName = ctx.from.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        let localAvatarPath = user.telegramAvatar;
        const photos = await ctx.telegram.getUserProfilePhotos(ctx.from.id, 0, 1);

        if (photos.total_count > 0) {
            const fileId = photos.photos?.[0]?.[0]?.file_id;
            if (fileId) {
                const fileLink = await ctx.telegram.getFileLink(fileId);
                localAvatarPath = await downloadAvatar(fileLink.href, user.id);
            }
        }

        await user.update({
            telegramId: ctx.from.id.toString(),
            telegramName: fullName,
            telegramAvatar: localAvatarPath
        });

        await ctx.reply(`✅ Привет, ${fullName}! Уведомления привязаны к аккаунту ${user.email}`);
    } catch (error) {
        console.error(error);
        ctx.reply('Ошибка привязки.');
    }
});

bot.launch();

export const sendPriceNotification = async (telegramId: string, message: string) => {
    try {
        await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (e) {
        console.error('Ошибка отправки в TG:', e);
    }
};

import { Router } from 'express';
import { LocalNotification } from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const list = await LocalNotification.findAll({
            where: { userId: req.user.userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(list);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

router.get('/unread', authenticateToken, async (req: any, res) => {
    try {
        const count = await LocalNotification.count({
            where: { userId: req.user.userId, isRead: false }
        });
        res.json({ count });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

router.post('/read-all', authenticateToken, async (req: any, res) => {
    try {
        await LocalNotification.update({ isRead: true }, {
            where: { userId: req.user.userId, isRead: false }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

router.delete('/clear-all', authenticateToken, async (req: any, res) => {
    try {
        await LocalNotification.destroy({
            where: { userId: req.user.userId }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка при очистке' });
    }
});

export default router;

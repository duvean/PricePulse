import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });
    return res.json({ message: 'User created' });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign(
        { 
        userId: user.id, 
        email: user.email
        }, 
        process.env.JWT_SECRET || 'super_secret', 
        { expiresIn: '24h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Ошибка логина:', error); 
    return res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'email', 'telegramId', 'telegramName', 'telegramAvatar']
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/unlink-telegram', authenticateToken, async (req: any, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (user) {
            await user.update({
                telegramId: null,
                telegramName: null,
                telegramAvatar: null
            });
            return res.json({ success: true });
        }
        res.status(404).json({ error: 'Пользователь не найден' });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;
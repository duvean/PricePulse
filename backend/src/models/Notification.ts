import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const LocalNotification = sequelize.define('l_notification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    productId: { type: DataTypes.INTEGER, allowNull: true }
});
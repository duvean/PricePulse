import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class User extends Model {
  declare id: number;
  declare email: string;
  declare password: string;
  declare telegramId: string;
  declare telegramName: string;
  declare telegramAvatar: string;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  telegramId: { type: DataTypes.STRING, allowNull: true, unique: true },
  telegramName: { type: DataTypes.STRING, allowNull: true },
  telegramAvatar: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, modelName: 'user' });

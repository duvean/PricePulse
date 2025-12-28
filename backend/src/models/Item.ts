import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Item extends Model {
  declare id: number;
  declare article: number;
  declare name: string;
  declare currentPrice: number;
  declare oldPrice: number;
  declare targetPrice: number;
  declare imageUrl: string;
  declare userId: number;
  declare lastNotifiedPrice: number;
}

Item.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  article: { type: DataTypes.BIGINT, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  currentPrice: { type: DataTypes.INTEGER, allowNull: false },
  oldPrice: { type: DataTypes.INTEGER, defaultValue: 0 },
  targetPrice: { type: DataTypes.INTEGER, allowNull: true },
  imageUrl: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lastNotifiedPrice: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null }
}, { sequelize, modelName: 'item' });
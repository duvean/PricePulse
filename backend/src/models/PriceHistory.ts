import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PriceHistory = sequelize.define('price_history', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
  itemId: { type: DataTypes.INTEGER, allowNull: false, },
  price: { type: DataTypes.INTEGER, allowNull: false, },
});


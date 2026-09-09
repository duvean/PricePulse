import { User } from './User.js';
import { Item } from './Item.js';
import { PriceHistory } from './PriceHistory.js';

User.hasMany(Item, { foreignKey: 'userId', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(User, { foreignKey: 'userId' });
Item.hasMany(PriceHistory, { foreignKey: 'itemId', as: 'history' });
PriceHistory.belongsTo(Item, { foreignKey: 'itemId' });

export { User, Item };

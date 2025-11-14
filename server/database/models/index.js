const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

User.hasMany(Order, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Order.belongsTo(User, {
  foreignKey: 'userId',
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
});

Product.hasMany(OrderItem, {
  foreignKey: 'productId',
});

module.exports = { User, Product, Order, OrderItem };
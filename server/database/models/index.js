const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');

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

// Cart associations
User.hasOne(Cart, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Cart.belongsTo(User, {
  foreignKey: 'userId',
});

Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  onDelete: 'CASCADE',
});

CartItem.belongsTo(Cart, {
  foreignKey: 'cartId',
});

CartItem.belongsTo(Product, {
  foreignKey: 'productId',
});

Product.hasMany(CartItem, {
  foreignKey: 'productId',
});

module.exports = { User, Product, Order, OrderItem, Cart, CartItem };
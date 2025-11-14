const express = require('express');
const { Cart, CartItem, Product } = require('../database/models');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Get current user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ where: { userId }, include: { model: CartItem, include: { model: Product, attributes: ['id','name','price','stock','image'] } } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }
    res.status(200).json({ success: true, message: 'Cart retrieved successfully', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving cart', data: error.message });
  }
});

// Add item to cart
router.post('/items', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid productId or quantity', data: {} });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', data: {} });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for product', data: {} });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId });

    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (item) {
      item.quantity = Math.min(item.quantity + quantity, product.stock);
      await item.save();
    } else {
      item = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    const updated = await Cart.findByPk(cart.id, { include: { model: CartItem, include: { model: Product, attributes: ['id','name','price','stock','image'] } } });
    res.status(200).json({ success: true, message: 'Item added to cart', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding item to cart', data: error.message });
  }
});

// Update item quantity
router.put('/items/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    if (isNaN(productId) || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid productId or quantity', data: {} });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', data: {} });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for product', data: {} });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId });

    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!item) {
      item = await CartItem.create({ cartId: cart.id, productId, quantity });
    } else {
      item.quantity = quantity;
      await item.save();
    }

    const updated = await Cart.findByPk(cart.id, { include: { model: CartItem, include: { model: Product, attributes: ['id','name','price','stock','image'] } } });
    res.status(200).json({ success: true, message: 'Cart item updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating cart item', data: error.message });
  }
});

// Remove item from cart
router.delete('/items/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId', data: {} });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(200).json({ success: true, message: 'Item removed', data: {} });

    await CartItem.destroy({ where: { cartId: cart.id, productId } });

    const updated = await Cart.findByPk(cart.id, { include: { model: CartItem, include: { model: Product, attributes: ['id','name','price','stock','image'] } } });
    res.status(200).json({ success: true, message: 'Item removed from cart', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing cart item', data: error.message });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ where: { userId } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }
    res.status(200).json({ success: true, message: 'Cart cleared', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error clearing cart', data: error.message });
  }
});

module.exports = router;

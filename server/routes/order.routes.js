const { Order, User, Product, OrderItem } = require('../database/models');
const express = require('express');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Get all orders (admin only - can view all orders)
router.get('/', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only', data: {} });
}

    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name', 'price'],
                    },
                },
            ],
        });
        res.status(200).json({ success: true, message: 'Orders retrieved successfully', data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving orders', data: error.message });
    }
});

// Get orders for current user
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.findAll({
            where: {
                userId: userId,
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name', 'price'],
                    },
                },
            ],
        });
        res.status(200).json({ success: true, message: 'User orders retrieved successfully', data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving user orders', data: error.message });
    }
});

// Get order by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Order id is not valid', data: {} });
        }

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name', 'price'],
                    },
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        // Check if the user is viewing their own order or is an admin
        if (order.userId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot view other user orders', data: {} });
        }

        res.status(200).json({ success: true, message: 'Order was found', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order', data: error.message });
    }
});

// Create new order with items
router.post('/', verifyToken, async (req, res) => {
    const t = await Order.sequelize.transaction();  

    try {
        const userId = req.userId;
        const { items, status } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain at least one item', data: {} });
        }

        let totalPrice = 0;
        const productsMap = {};

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });

            if (!product) {
                await t.rollback();
                return res.status(400).json({ success: false, message: `Product ${item.productId} not found`, data: {} });
            }

            if (item.quantity < 1) {
                await t.rollback();
                return res.status(400).json({ success: false, message: 'Quantity must be >= 1', data: {} });
            }

            if (product.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${product.name}`,
                    data: {}
                });
            }

            productsMap[item.productId] = product;

            totalPrice += product.price * item.quantity;
        }

        const order = await Order.create({
            userId,
            totalPrice,
            status: status || 'pending',
            orderDate: new Date(),
        }, { transaction: t });

        for (const item of items) {
            const product = productsMap[item.productId];

            await OrderItem.create({
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            }, { transaction: t });

            product.stock -= item.quantity;
            await product.save({ transaction: t });
        }

        await t.commit();

        const completeOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name', 'price'],
                    },
                },
            ],
        });

        res.status(201).json({ success: true, message: 'Order created successfully', data: completeOrder });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: 'Error creating order', data: error.message });
    }
});


// Update order (status and items)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Order id is not valid', data: {} });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        // Check if the user owns this order or is an admin
        if (order.userId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot update other user orders', data: {} });
        }

        const { items, status } = req.body;

        // If items are provided, recalculate total price
        if (items && Array.isArray(items)) {
            let totalPrice = 0;
            for (const item of items) {
                if (!item.productId || !item.quantity || item.quantity < 1) {
                    return res.status(400).json({ success: false, message: 'Each item must have productId and quantity >= 1', data: {} });
                }

                const product = await Product.findByPk(item.productId);
                if (!product) {
                    return res.status(400).json({ success: false, message: `Product ${item.productId} not found`, data: {} });
                }

                totalPrice += product.price * item.quantity;
            }

            // Delete old items and create new ones
            await OrderItem.destroy({ where: { orderId: order.id } });
            for (const item of items) {
                const product = await Product.findByPk(item.productId);
                await OrderItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });
            }

            await order.update({ totalPrice, status: status || order.status });
        } else {
            // Just update status
            await order.update({ status: status || order.status });
        }

        // Fetch updated order with items
        const updatedOrder = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name', 'price'],
                    },
                },
            ],
        });

        res.status(200).json({ success: true, message: 'Order updated successfully', data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order', data: error.message });
    }
});

// Delete order
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Order id is not valid', data: {} });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found', data: {} });
        }

        // Check if the user owns this order or is an admin
        if (order.userId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete other user orders', data: {} });
        }

        await order.destroy();

        res.status(200).json({ success: true, message: 'Order successfully deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting order', data: error.message });
    }
});

module.exports = router;

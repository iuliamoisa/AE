import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CartItem from '../components/CartItem';
import { removeItem, updateQuantity, clearCart, setCart } from '../store/slices/cartSlice';
import { createOrder } from '../api/order.routes';
import { fetchCart, removeCartItem, updateCartItem, clearCartApi } from '../api/cart.routes';

export default function CartPage() {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = async (productId) => {
    if (user) {
      try {
        const res = await removeCartItem(productId);
        if (res?.success) {
          const items = res.data?.CartItems || [];
          dispatch(setCart({ items: items.map(i => ({ productId: i.productId, name: i.Product?.name, price: i.price || i.Product?.price, image: i.Product?.image, quantity: i.quantity })) }));
          return;
        }
      } catch (err) {
        console.error('Failed to remove cart item from server', err);
      }
    }
    dispatch(removeItem(productId));
  };

  const handleChangeQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    if (user) {
      try {
        const res = await updateCartItem(productId, quantity);
        if (res?.success) {
          const items = res.data?.CartItems || [];
          dispatch(setCart({ items: items.map(i => ({ productId: i.productId, name: i.Product?.name, price: i.price || i.Product?.price, image: i.Product?.image, quantity: i.quantity })) }));
          return;
        }
      } catch (err) {
        console.error('Failed to update cart item on server', err);
      }
    }
    dispatch(updateQuantity({ productId, quantity }));
  };

  const calculateTotal = () => {
    return (cart.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast('Please login to complete the purchase');
      navigate('/login');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const items = cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    try {
      const response = await createOrder({ items });
      if (response?.success) {
        toast.success('Order created successfully');
        // clear both client and server cart when logged in
        try {
          if (user) await clearCartApi();
        } catch (err) {
          console.error('Failed to clear server cart', err);
        }
        dispatch(clearCart());
        navigate('/orders');
      } else {
        toast.error(response?.message || 'Failed to create order');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating the order');
    }
  };

  useEffect(() => {
    const loadServerCart = async () => {
      if (!user) return;
      try {
        const res = await fetchCart();
        if (res?.success) {
          const items = res.data?.CartItems || [];
          dispatch(setCart({ items: items.map(i => ({ productId: i.productId, name: i.Product?.name, price: i.price || i.Product?.price, image: i.Product?.image, quantity: i.quantity })) }));
        }
      } catch (err) {
        console.error('Failed to fetch server cart', err);
      }
    };
    loadServerCart();
  }, [user]);

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

        {(!cart.items || cart.items.length === 0) ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-gray-500 font-medium">Your cart is empty.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg">
            <div className="p-4">
              {(cart.items || []).map((item) => (
                <CartItem key={item.productId} item={item} onRemove={handleRemove} onChangeQuantity={handleChangeQuantity} />
              ))}
            </div>
            <div className="border-t p-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">${calculateTotal()}</div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => dispatch(clearCart())} className="rounded-md border px-4 py-2">Clear</button>
                <button onClick={handleCheckout} className="rounded-md bg-indigo-600 px-4 py-2 text-white">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

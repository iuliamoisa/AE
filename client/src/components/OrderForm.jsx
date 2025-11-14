import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchProducts } from '../api/product.routes';
import LoadingSpinner from './LoadingSpinner';

/**
 * OrderForm - Form for creating and editing orders with product selection
 * @param {Object} order - Order data for edit mode (null for create mode)
 * @param {Function} onSubmit - Callback function that handles the form submission
 * @param {boolean} isLoading - Loading state
 */
export default function OrderForm({ order = null, onSubmit, isLoading = false }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await fetchProducts();
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        toast.error('Failed to load products');
        console.error('Error loading products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (order?.OrderItems) {
      setItems(
        order.OrderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.Product?.name,
          productPrice: item.Product?.price,
        }))
      );
      setStatus(order.status || 'pending');
    }
  }, [order]);

  const handleAddProduct = (e) => {
    const productId = parseInt(e.target.value);
    if (!productId) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (items.some((item) => item.productId === productId)) {
      toast.error('Product already added to order');
      e.target.value = '';
      return;
    }

    setItems([
      ...items,
      {
        productId,
        quantity: 1,
        productName: product.name,
        productPrice: product.price,
      },
    ]);
    e.target.value = '';
  };

  const handleQuantityChange = (productId, quantity) => {
    const numQuantity = parseInt(quantity) || 1;
    if (numQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && numQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available for ${product.name}`);
      return;
    }

    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: numQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    try {
      setSubmitLoading(true);
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        status,
      };
      await onSubmit(orderData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  if (isLoading || productsLoading) {
    return <LoadingSpinner />;
  }

  const availableProducts = products.filter(
    (p) => !items.some((item) => item.productId === p.id)
  );

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          {order ? 'Edit Order' : 'Create New Order'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Products</h2>
            
            {availableProducts.length > 0 ? (
              <div>
                <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product to Add
                </label>
                <select
                  id="product-select"
                  onChange={handleAddProduct}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2 mb-4"
                  defaultValue=""
                >
                  <option value="">-- Select a product --</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No more products available to add</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            {items.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Subtotal</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">${item.productPrice.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            className="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ${(item.productPrice * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 px-4 py-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                    <span className="text-lg font-bold text-indigo-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-gray-500 font-medium">No items added yet. Select a product above to get started.</p>
              </div>
            )}
          </div>


          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitLoading || items.length === 0}
              className="flex-1 flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 flex justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

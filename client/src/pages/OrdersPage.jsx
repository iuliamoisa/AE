import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchMyOrders, deleteOrder } from '../api/order.routes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const { data } = await fetchMyOrders();
        if (data && Array.isArray(data)) {
          setOrders(data);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  const handleEditClick = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  const handleDeleteClick = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setDeletingId(orderId);
      const response = await deleteOrder(orderId);

      if (response?.success) {
        setOrders(orders.filter((o) => o.id !== orderId));
        toast.success('Order deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete order');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while deleting the order');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateClick = () => {
    navigate('/orders/create');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold mb-4">No orders yet</p>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Orders</h2>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div
                className="bg-gray-50 px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(order.orderDate)} • {order.OrderItems?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 ml-4 transition-transform ${
                      expandedOrderId === order.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="border-t">
                  {order.OrderItems && order.OrderItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Quantity</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.OrderItems.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{item.Product?.name}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-700">${item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">
                              Order Total:
                            </td>
                            <td className="px-4 py-3 text-right text-lg font-bold text-indigo-600">
                              ${order.totalPrice.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p>No items in this order</p>
                    </div>
                  )}

                  <div className="bg-gray-50 px-4 py-4 flex gap-2 justify-end border-t">
                    <button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => handleEditClick(order.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDeleteClick(order.id)}
                      disabled={deletingId === order.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

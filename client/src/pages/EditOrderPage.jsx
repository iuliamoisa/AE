import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import OrderForm from '../components/OrderForm';
import { getOrderById, updateOrder } from '../api/order.routes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);

        if (response?.success || response?.data) {
          setOrder(response.data || response);
        } else {
          setError(response?.message || 'Failed to load order');
          toast.error('Failed to load order');
          setTimeout(() => navigate('/orders'), 2000);
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching the order');
        toast.error('An error occurred while fetching the order');
        setTimeout(() => navigate('/orders'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const response = await updateOrder(id, formData);

      if (response?.success) {
        toast.success('Order updated successfully!');
        navigate('/orders');
      } else {
        toast.error(response?.message || 'Failed to update order');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while updating the order');
      throw error;
    }
  };

  if (error && !order) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return <OrderForm order={order} onSubmit={handleSubmit} isLoading={loading} />;
}

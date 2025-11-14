import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import OrderForm from '../components/OrderForm';
import { createOrder } from '../api/order.routes';

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const response = await createOrder(formData);

      if (response?.success) {
        toast.success('Order created successfully!');
        navigate('/orders');
      } else {
        toast.error(response?.message || 'Failed to create order');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating the order');
      throw error;
    }
  };

  return <OrderForm onSubmit={handleSubmit} />;
}

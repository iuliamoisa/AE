import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchProducts } from '../api/product.routes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const {data} = await fetchProducts();
        if (data && Array.isArray(data)) {
          setProducts(data);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

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

  if (!products || products.length === 0) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="relative">
                <img
                  alt={product.name}
                  src={product.image || 'https://via.placeholder.com/300'}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md shadow-lg transition-colors duration-200"
                      onClick={() => console.log('Edit product:', product.id)}
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-lg transition-colors duration-200"
                      onClick={() => console.log('Delete product:', product.id)}
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

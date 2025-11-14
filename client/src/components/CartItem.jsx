import React from 'react';

export default function CartItem({ item, onRemove, onChangeQuantity }) {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onChangeQuantity(item.productId, parseInt(e.target.value || '1'))}
          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-2 py-1"
        />
        <div className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

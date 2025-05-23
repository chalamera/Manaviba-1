import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/cartContext';

const CartButton = () => {
  const { state } = useCart();

  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
    >
      <ShoppingCart className="w-6 h-6 text-gray-600" />
      {state.items.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {state.items.length}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, ShoppingBag, CreditCard, AlertCircle } from 'lucide-react';
import { useCart } from '../lib/cartContext';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/login');
        return;
      }

      // Create Stripe Checkout Session
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout session creation failed');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw stripeError;

    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error instanceof Error ? error.message : '購入処理に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>戻る</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-600">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium">{state.items.length} アイテム</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">ショッピングカート</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">カートは空です</h2>
                <p className="text-gray-600">商品を追加してお買い物を続けましょう</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 px-6 py-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  商品を探す
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="divide-y divide-gray-100">
                  {state.items.map((item) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-800 mb-1">{item.title}</h3>
                          <p className="text-xl font-bold text-purple-600">
                            ¥{item.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>小計</span>
                      <span>¥{state.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>手数料</span>
                      <span>¥0</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                      <span>合計</span>
                      <span>¥{state.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-medium
                      hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                      transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 shadow-lg
                      flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{loading ? '処理中...' : '購入する'}</span>
                  </button>

                  <p className="mt-4 text-center text-sm text-gray-500">
                    購入することで、
                    <a href="/terms" className="text-purple-600 hover:text-purple-500">
                      利用規約
                    </a>
                    に同意したものとみなされます
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
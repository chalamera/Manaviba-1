import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('メールアドレスまたはパスワードが正しくありません。');
        } else {
          setError('ログインに失敗しました。もう一度お試しください。');
        }
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // Sample product data for background
  const sampleProducts = Array(12).fill({
    title: 'データ構造とアルゴリズム',
    university: '東京大学',
    department: '工学部',
    price: '¥1,200',
    rating: 4.9,
    reviews: 128,
  });

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Background product grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 transform -rotate-12 scale-110 blur-sm">
          {sampleProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-md"
            >
              <div className="h-32 bg-blue-50 rounded-md mb-3"></div>
              <h3 className="text-sm font-medium text-gray-800 truncate">{product.title}</h3>
              <p className="text-xs text-gray-500">{product.university}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-[#3366CC]">{product.price}</span>
                <div className="text-xs text-gray-500">★ {product.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login form */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img src="/manaviba-icon.svg" alt="Manaviba" className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Manavibaへようこそ</h1>
              <p className="text-gray-600 mt-2">アカウントにログインして続けましょう</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3366CC] to-blue-600 text-white py-3 px-6 rounded-lg font-medium
                  hover:from-[#2952A3] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#3366CC] focus:ring-offset-2
                  transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                アカウントをお持ちでない方は{' '}
                <Link to="/register" className="text-[#3366CC] hover:text-[#2952A3] font-medium">
                  新規登録
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
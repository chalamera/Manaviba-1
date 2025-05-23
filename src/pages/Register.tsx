import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      setLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError('ユーザー名を入力してください。');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          setError('このメールアドレスは既に登録されています。');
        } else if (signUpError.message?.includes('password')) {
          setError('パスワードは6文字以上で入力してください。');
        } else {
          setError('登録に失敗しました。もう一度お試しください。');
        }
        return;
      }

      if (data?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('登録に失敗しました。もう一度お試しください。');
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 transform rotate-12 scale-110 blur-sm">
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

      {/* Registration form */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img src="/manaviba-icon.svg" alt="Manaviba" className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">アカウント作成</h1>
              <p className="text-gray-600 mt-2">Manavibaへようこそ</p>
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
                  ユーザー名
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200"
                  placeholder="username"
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
                <p className="mt-1 text-sm text-gray-500">6文字以上で入力してください</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認）
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {loading ? '登録中...' : '登録する'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <Link to="/login" className="text-[#3366CC] hover:text-[#2952A3] font-medium">
                  ログイン
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
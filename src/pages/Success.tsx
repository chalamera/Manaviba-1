import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setup = searchParams.get('setup');

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        {setup === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Stripeアカウントの設定が完了しました
            </h1>
            <p className="text-gray-600 mb-6">
              これで売上を受け取る準備が整いました。ダッシュボードに自動的に戻ります。
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              購入が完了しました
            </h1>
            <p className="text-gray-600 mb-6">
              ご購入ありがとうございます。ダッシュボードに自動的に戻ります。
            </p>
          </>
        )}
        <div className="animate-pulse text-sm text-gray-500">
          リダイレクト中...
        </div>
      </div>
    </div>
  );
};

export default Success;
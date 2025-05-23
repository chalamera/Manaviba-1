import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Download, Star, ExternalLink, TrendingUp, CreditCard, Package, ShoppingBag, AlertCircle, ChevronRight, User, FileText, Wallet } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import FileViewer from '../components/FileViewer';

// ... (keep all existing interfaces and type definitions)

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'listings' | 'purchases' | 'sales'>('listings');
  const [listings, setListings] = useState<Note[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Record<string, Rating[]>>({});
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalOrders: 0,
    notesSold: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [viewer, setViewer] = useState<ViewerState>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });
  const [searchParams] = useSearchParams();
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const fetchInitialData = async (userId: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          ratings (rating)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setListings(notesData || []);

      const { data: purchasesData, error: purchasesError } = await supabase
        .from('orders')
        .select(`
          *,
          note:notes (*)
        `)
        .eq('buyer_id', userId)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;
      setPurchases(purchasesData || []);

      const salesData = await supabase
        .from('orders')
        .select(`
          *,
          note:notes (*)
        `)
        .eq('payment_status', 'completed')
        .in('note_id', (notesData || []).map(note => note.id));

      if (salesData.error) throw salesData.error;

      const summary = (salesData.data || []).reduce((acc, order) => {
        const noteId = order.note_id;
        const note = order.note;
        const price = note.price;

        acc.totalSales += price;
        acc.totalOrders += 1;

        const existingNote = acc.notesSold.find(n => n.note.id === noteId);
        if (existingNote) {
          existingNote.count += 1;
          existingNote.revenue += price;
        } else {
          acc.notesSold.push({
            note,
            count: 1,
            revenue: price
          });
        }

        return acc;
      }, {
        totalSales: 0,
        totalOrders: 0,
        notesSold: [] as SalesSummary['notesSold']
      });

      setSalesSummary(summary);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const checkStripeStatus = async () => {
    if (!stripeAccountId) return;
    
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/check-account-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: stripeAccountId }),
      });

      if (!response.ok) throw new Error('Failed to check account status');

      const { status } = await response.json();
      setStripeAccountStatus(status);

      // Update the status in the database
      await supabase
        .from('profiles')
        .update({ stripe_account_status: status })
        .eq('id', user?.id);

    } catch (error) {
      console.error('Error checking Stripe status:', error);
      setError('Stripeアカウントのステータス確認に失敗しました');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, stripe_account_id, stripe_account_status')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setStripeAccountId(profileData.stripe_account_id);
        setStripeAccountStatus(profileData.stripe_account_status);

        await fetchInitialData(user.id);

      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      }
    };
    checkAuth();

    const setup = searchParams.get('setup');
    const refresh = searchParams.get('refresh');
    
    if (setup === 'success' || refresh === 'true') {
      checkStripeStatus();
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (!user) return;
      
      try {
        setError(null);
        setLoading(true);

        if (activeTab === 'purchases') {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('orders')
            .select(`
              *,
              note:notes (*)
            `)
            .eq('buyer_id', user.id)
            .eq('payment_status', 'completed')
            .order('created_at', { ascending: false });

          if (purchasesError) throw purchasesError;
          setPurchases(purchasesData || []);

          if (purchasesData) {
            const noteIds = purchasesData.map(order => order.note_id);
            const { data: ratingsData, error: ratingsError } = await supabase
              .from('ratings')
              .select('*')
              .in('note_id', noteIds)
              .eq('user_id', user.id);

            if (ratingsError) throw ratingsError;

            const ratingsByNote = ratingsData?.reduce((acc, rating) => {
              if (!acc[rating.note_id]) {
                acc[rating.note_id] = [];
              }
              acc[rating.note_id].push(rating);
              return acc;
            }, {} as Record<string, Rating[]>);

            setRatings(ratingsByNote || {});
          }
        } else if (activeTab === 'sales') {
          const { data: salesData, error: salesError } = await supabase
            .from('orders')
            .select(`
              *,
              note:notes (*)
            `)
            .eq('payment_status', 'completed')
            .in('note_id', listings.map(note => note.id));

          if (salesError) throw salesError;

          const summary = (salesData || []).reduce((acc, order) => {
            const noteId = order.note_id;
            const note = order.note;
            const price = note.price;

            acc.totalSales += price;
            acc.totalOrders += 1;

            const existingNote = acc.notesSold.find(n => n.note.id === noteId);
            if (existingNote) {
              existingNote.count += 1;
              existingNote.revenue += price;
            } else {
              acc.notesSold.push({
                note,
                count: 1,
                revenue: price
              });
            }

            return acc;
          }, {
            totalSales: 0,
            totalOrders: 0,
            notesSold: [] as SalesSummary['notesSold']
          });

          setSalesSummary(summary);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('データの取得に失敗しました。ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, user, listings]);

  const createStripeAccount = async () => {
    if (!user) return;
    
    try {
      setStripeLoading(true);
      setError(null);

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-connect-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Stripe account');
      }

      const { accountId } = await response.json();
      setStripeAccountId(accountId);
      await redirectToStripeOnboarding(accountId);

    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setError('Stripeアカウントの作成に失敗しました');
    } finally {
      setStripeLoading(false);
    }
  };

  const redirectToStripeOnboarding = async (accountId: string) => {
    try {
      setStripeLoading(true);
      setError(null);

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('インターネット接続を確認してください');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-account-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          accountId,
          origin: window.location.origin // Add origin for proper redirect URLs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Stripeアカウントの設定に失敗しました (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('Stripeアカウントの設定URLの取得に失敗しました');
      }

      // Use window.location.href for reliable redirection
      window.location.href = data.url;

    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
      setError(error instanceof Error ? error.message : 'Stripeアカウントの設定に失敗しました');
      setStripeLoading(false);
    }
  };

  const openStripeDashboard = async () => {
    if (!stripeAccountId) return;
    
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-login-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: stripeAccountId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create login link');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
      setError('Stripeダッシュボードを開けませんでした');
    }
  };

  const handleRating = async (noteId: string, rating: number) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('ログインが必要です');
      }

      const { data: existingRating, error: fetchError } = await supabase
        .from('ratings')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let ratingError;
      if (existingRating) {
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ rating })
          .eq('id', existingRating.id);
        ratingError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ratings')
          .insert({
            note_id: noteId,
            user_id: user.id,
            rating
          });
        ratingError = insertError;
      }

      if (ratingError) throw ratingError;

      setRatings(prev => ({
        ...prev,
        [noteId]: [{ rating }]
      }));
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('評価の送信に失敗しました。もう一度お試しください。');
    }
  };

  const renderStripeConnectSection = () => {
    if (activeTab !== 'sales') return null;

    return (
      <div className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            <span>売上受け取りの設定</span>
          </h3>

          {!stripeAccountId ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                売上を受け取るには、Stripeアカウントの設定が必要です。
                数分で簡単に設定できます。
              </p>
              <button
                onClick={createStripeAccount}
                disabled={stripeLoading}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl font-medium
                  hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{stripeLoading ? '処理中...' : 'Stripeアカウントを設定する'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stripeAccountStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium">
                  {stripeAccountStatus === 'verified' ? 'アカウント設定完了' : '設定を完了してください'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {stripeAccountStatus === 'pending' ? (
                  <button
                    onClick={() => redirectToStripeOnboarding(stripeAccountId)}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium
                      hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>アカウント設定を完了する</span>
                  </button>
                ) : (
                  <button
                    onClick={openStripeDashboard}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium
                      hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Stripeダッシュボードを開く</span>
                  </button>
                )}
              </div>

              {stripeAccountStatus === 'verified' && (
                <p className="text-sm text-gray-600">
                  ✓ 売上は自動的にあなたの銀行口座に振り込まれます
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1">
                {profile?.username || 'ユーザー'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">{profile?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-12">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500">出品中</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">{listings.length}</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500">購入済み</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">{purchases.length}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500">総売上</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">
              {`¥${salesSummary.totalSales.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6 sm:mb-8 overflow-x-auto">
          <nav className="flex min-w-full">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium ${
                activeTab === 'listings'
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              出品中
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium ${
                activeTab === 'purchases'
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              購入履歴
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium ${
                activeTab === 'sales'
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              売上管理
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {renderStripeConnectSection()}

        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">出品中の商品はありません</h3>
                <p className="text-gray-600 mb-6">あなたの知識を共有して、収益化しましょう</p>
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  商品を出品する
                </Link>
              </div>
            ) : (
              listings.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {note.preview_url || (note.preview_images && note.preview_images.length > 0) ? (
                    <img
                      src={note.preview_images?.[0] || note.preview_url}
                      alt={note.title}
                      className="w-full h-36 sm:h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-36 sm:h-48 bg-purple-50 flex items-center justify-center">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-purple-200" />
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {note.university} - {note.subject}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        {`¥${note.price.toLocaleString()}`}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-4 sm:space-y-6">
            {purchases.length === 0 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">購入した商品はありません</h3>
                <p className="text-gray-600 mb-6">他の学生が共有した学びを活用しましょう</p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  商品を探す
                </Link>
              </div>
            ) : (
              purchases.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {order.note.title}
                      </h3>
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        購入済み
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      {order.note.university} - {order.note.subject}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <p className="text-sm text-gray-500">
                          購入日: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRating(order.note_id, star)}
                              className="focus:outline-none transform hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= (ratings[order.note_id]?.[0]?.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-purple-600">
                        {`¥${order.note.price.toLocaleString()}`}
                      </p>
                    </div>
                    
                    {order.note.file_url && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setViewer({
                            isOpen: true,
                            fileUrl: order.note.file_url!,
                            fileName: order.note.title
                          })}
                          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-[#3366CC] text-white rounded-xl font-medium hover:bg-[#2952A3] transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          <span>ファイルを表示</span>
                        </button>
                        <a
                          href={order.note.file_url}
                          download
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>ダウンロード</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-white/80">総売上</span>
                </div>
                <p className="text-2xl sm:text-4xl font-bold mb-2">
                  {`¥${salesSummary.totalSales.toLocaleString()}`}
                </p>
                <p className="text-sm sm:text-base text-white/80">
                  累計販売数: {salesSummary.totalOrders} 件
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-500">Stripe ダッシュボード</span>
                </div>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-500 font-medium"
                >
                  <span>詳細な売上情報を確認</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">商品別の売上</h3>
                <div className="divide-y divide-gray-100">
                  {salesSummary.notesSold.length === 0 ? (
                    <div className="py-8 sm:py-12 text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">売上はまだありません</h3>
                      <p className="text-sm sm:text-base text-gray-600">商品を出品して、収益化を始めましょう</p>
                    </div>
                  ) : (
                    salesSummary.notesSold.map(({ note, count, revenue }) => (
                      <div key={note.id} className="py-4 sm:py-6 first:pt-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-1">{note.title}</h4>
                            <p className="text-sm text-gray-600">
                              {note.university} - {note.subject}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              販売数: {count} 件
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-bold text-purple-600">
                              {`¥${revenue.toLocaleString()}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              単価: {`¥${note.price.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewer.isOpen && (
          <FileViewer
            fileUrl={viewer.fileUrl}
            fileName={viewer.fileName}
            onClose={() => setViewer({ isOpen: false, fileUrl: '', fileName: '' })}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
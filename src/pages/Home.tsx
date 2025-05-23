import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, CreditCard, Search, TrendingUp, Users, BookOpen, Star, FileText, Download, Info, DollarSign, UserCircle, Book, FileQuestion, Mic, FileSpreadsheet, Share2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 px-4 py-12 sm:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs - Adjusted for mobile */}
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 sm:w-64 h-48 sm:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Grid Pattern - Smaller on mobile */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8 flex items-center justify-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm sm:text-base">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-gray-600 font-medium">4.8/5.0の評価</span>
              <span className="mx-2 text-gray-300">|</span>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-gray-600 font-medium">1,000+ 人が利用中</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 animate-gradient text-center px-4">
            大学の学びを<br className="sm:hidden" />
            シェアして、<br />
            収益化しよう
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto text-center px-4">
            講義ノートや過去問を売買できる学生向けマーケットプレイス。
            あなたの知識が誰かの助けになります。
          </p>

          <div className="px-4 mb-8 sm:mb-12">
            <SearchBar className="max-w-3xl mx-auto" />
          </div>

          {/* Featured Categories - Mobile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
            {[
              { icon: Book, label: '講義ノート' },
              { icon: FileQuestion, label: '過去問' },
              { icon: FileSpreadsheet, label: '資料まとめ' },
              { icon: Mic, label: '講義録音' },
            ].map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/90 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* How It Works Section - Mobile Optimized */}
      <div className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-[#3366CC] rounded-full text-sm font-medium mb-4">HOW IT WORKS</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3366CC] to-blue-600">
              使い方
            </h2>
            <p className="text-gray-600">
              Manavibaの使い方は簡単です
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {/* Sellers */}
            <div className="glass-card p-6 sm:p-8 hover-lift">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#3366CC]" />
                出品者の場合
              </h3>
              <div className="space-y-6 sm:space-y-8">
                {[
                  {
                    step: 1,
                    title: 'アカウント作成',
                    description: '名前、メールアドレス、パスワードで簡単登録'
                  },
                  {
                    step: 2,
                    title: '資料をアップロード',
                    description: '講義ノートや過去問をPDFまたは画像でアップロード'
                  },
                  {
                    step: 3,
                    title: '詳細情報を入力',
                    description: 'タイトル、説明、大学、科目、価格を設定'
                  },
                  {
                    step: 4,
                    title: '収益を得る',
                    description: '購入があると自動的に収益が発生'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#3366CC] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyers */}
            <div className="glass-card p-6 sm:p-8 hover-lift">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#3366CC]" />
                購入者の場合
              </h3>
              <div className="space-y-6 sm:space-y-8">
                {[
                  {
                    step: 1,
                    title: 'アカウント作成',
                    description: '名前、メールアドレス、パスワードで簡単登録'
                  },
                  {
                    step: 2,
                    title: '資料を検索',
                    description: 'キーワード、大学、科目で必要な資料を検索'
                  },
                  {
                    step: 3,
                    title: '購入',
                    description: 'Stripeで安全に決済'
                  },
                  {
                    step: 4,
                    title: 'ダウンロードとレビュー',
                    description: '資料をダウンロードして、評価とレビューを投稿'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#3366CC] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Mobile Optimized */}
      <div className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-[#3366CC] rounded-full text-sm font-medium mb-4">FEATURES</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3366CC] to-blue-600">
              主要機能
            </h2>
            <p className="text-gray-600">
              Manavibaで学びを共有し、効率的に勉強しましょう
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3366CC] to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">簡単出品</h3>
              <p className="text-sm sm:text-base text-gray-600">
                講義ノートや過去問をアップロードして、自分で価格を設定。あなたの学びを収益化できます。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3366CC] to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">スマート検索</h3>
              <p className="text-sm sm:text-base text-gray-600">
                大学、科目、キーワードで必要な資料を素早く見つけることができます。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3366CC] to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">シンプルな取引</h3>
              <p className="text-sm sm:text-base text-gray-600">
                簡単な操作で取引が完了。必要な資料にすぐにアクセスできます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile Optimized */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-[#3366CC] mx-auto mb-4" />
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">10,000+</div>
              <div className="text-sm sm:text-base text-gray-600">取引完了</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#3366CC] mx-auto mb-4" />
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">5,000+</div>
              <div className="text-sm sm:text-base text-gray-600">登録ユーザー</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#3366CC] mx-auto mb-4" />
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">3,000+</div>
              <div className="text-sm sm:text-base text-gray-600">出品中の商品</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Mobile Optimized */}
      <div className="relative py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#3366CC] to-blue-600">
            あなたの学びを共有しませんか？
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Manavibaで、あなたの知識を価値に変えましょう。
          </p>
          <a
            href="/register"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#3366CC] to-blue-600 text-white rounded-lg font-medium 
              hover:from-[#2952A3] hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg text-base sm:text-lg"
          >
            無料で始める
          </a>

          {/* Terms Link */}
          <div className="absolute bottom-4 right-4">
            <Link
              to="/terms"
              className="text-xs sm:text-sm text-gray-500 hover:text-[#3366CC] transition-colors flex items-center space-x-1"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>利用規約</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
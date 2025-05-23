import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, User, Menu, X, ShoppingCart, Upload, HelpCircle, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/manaviba-icon.svg" alt="Manaviba" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-800">Manaviba</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#3366CC] hover:bg-blue-50"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isHomePage && (
              <Link
                to="/"
                className="nav-link flex items-center space-x-1"
              >
                <Home className="h-5 w-5" />
                <span>ホーム</span>
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="nav-link flex items-center space-x-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>カート</span>
                </Link>
                <Link
                  to="/create"
                  className="nav-link flex items-center space-x-1"
                >
                  <Upload className="h-5 w-5" />
                  <span>商品を出品</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="nav-link flex items-center space-x-1"
                >
                  <User className="h-5 w-5" />
                  <span>マイページ</span>
                </Link>
                <a
                  href="https://forms.gle/ghoWLvxU4Upa1WTx6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link flex items-center space-x-1"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>お問い合わせ</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center space-x-1"
                >
                  <LogOut className="h-5 w-5" />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link flex items-center space-x-1"
                >
                  <LogIn className="h-5 w-5" />
                  <span>ログイン</span>
                </Link>
                <Link
                  to="/register"
                  className="nav-link flex items-center space-x-1"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 bg-white border-t border-gray-100 transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? 'max-h-[calc(100vh-4rem)] opacity-100 overflow-y-auto'
              : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
          }`}
        >
          <div className="py-4 space-y-4 px-4">
            {!isHomePage && (
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 nav-link"
              >
                <Home className="h-5 w-5" />
                <span>ホーム</span>
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>カート</span>
                </Link>
                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <Upload className="h-5 w-5" />
                  <span>商品を出品</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <User className="h-5 w-5" />
                  <span>マイページ</span>
                </Link>
                <a
                  href="https://forms.gle/ghoWLvxU4Upa1WTx6"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>お問い合わせ</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 nav-link"
                >
                  <LogOut className="h-5 w-5" />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <LogIn className="h-5 w-5" />
                  <span>ログイン</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 nav-link"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, ChevronLeft, ShoppingCart, User } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import { useCart } from '../lib/cartContext';
import CommentThread from '../components/CommentThread';
import ImagePreview from '../components/ImagePreview';

interface Note {
  id: string;
  title: string;
  description: string;
  university: string;
  subject: string;
  price: number;
  preview_url: string | null;
  preview_images: string[];
  file_url: string | null;
  seller_id: string;
  seller: {
    username: string;
    email: string;
  };
  ratings: {
    rating: number;
  }[];
}

const NoteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { state, dispatch } = useCart();

  const fetchNoteData = async () => {
    if (!id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select(`
          *,
          ratings (rating),
          seller:profiles!notes_seller_id_fkey (username, email)
        `)
        .eq('id', id)
        .single();

      if (noteError) throw noteError;

      if (user) {
        const { data: orderData } = await supabase
          .from('orders')
          .select()
          .eq('note_id', id)
          .eq('buyer_id', user.id)
          .eq('payment_status', 'completed');

        setHasPurchased(orderData && orderData.length > 0);
      }

      setNote(noteData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteData();
  }, [id]);

  const isInCart = note && state.items.some(item => item.id === note.id);

  const handleAddToCart = () => {
    if (!note) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: note.id,
        title: note.title,
        price: note.price
      }
    });
    navigate('/cart');
  };

  if (loading || !note) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const averageRating = note.ratings && note.ratings.length > 0
    ? note.ratings.reduce((acc, r) => acc + r.rating, 0) / note.ratings.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>戻る</span>
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ImagePreview
          images={note.preview_images || (note.preview_url ? [note.preview_url] : [])}
          alt={note.title}
        />
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{note.title}</h1>
          
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{note.seller.username}</p>
              <p className="text-sm text-gray-500">出品者</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-gray-600">{note.university}</span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-600">{note.subject}</span>
          </div>
          <div className="mb-6">
            <RatingStars
              rating={averageRating}
              size="lg"
              showCount
              count={note.ratings?.length || 0}
            />
          </div>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{note.description}</p>
          <div className="flex items-center justify-end mb-8">
            <div className="text-2xl font-bold text-indigo-600">
              ¥{note.price.toLocaleString()}
            </div>
          </div>
          {hasPurchased ? (
            <a
              href={note.file_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-secondary"
            >
              商品をダウンロード
            </a>
          ) : isInCart ? (
            <button
              onClick={() => navigate('/cart')}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>カートを確認</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>カートに追加</span>
            </button>
          )}
        </div>
      </div>

      <CommentThread noteId={id} />
    </div>
  );
};

export default NoteDetails;
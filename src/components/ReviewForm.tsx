import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewFormProps {
  noteId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ noteId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          note_id: noteId,
          reviewer_id: user.id,
          rating,
          comment: comment.trim(),
        });

      if (reviewError) throw reviewError;

      setComment('');
      setRating(0);
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('レビューの投稿に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          評価
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          コメント
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="このノートについての感想を書いてください"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? '投稿中...' : 'レビューを投稿'}
      </button>
    </form>
  );
};

export default ReviewForm;
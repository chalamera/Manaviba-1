import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RatingStars from '../components/RatingStars';
import { ChevronLeft, BookOpen, FileText, FileSpreadsheet, Mic, Tag, Search, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ImagePreview from '../components/ImagePreview';

interface Note {
  id: string;
  title: string;
  university: string;
  subject: string;
  price: number;
  preview_url: string | null;
  preview_images: string[];
  category: 'lecture_note' | 'past_exam' | 'summary' | 'recording' | 'other';
  ratings: {
    rating: number;
  }[];
}

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain p-4"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categories = [
    { id: 'lecture_note', label: '講義ノート', icon: BookOpen },
    { id: 'past_exam', label: '過去問', icon: FileText },
    { id: 'summary', label: '資料まとめ', icon: FileSpreadsheet },
    { id: 'recording', label: '講義録音', icon: Mic },
    { id: 'other', label: 'その他', icon: Tag },
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      let query = supabase
        .from('notes')
        .select(`
          *,
          ratings (rating)
        `);

      // Search query filter
      if (searchParams.get('q')) {
        const searchQuery = searchParams.get('q');
        query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`);
      }

      // Category filter
      if (searchParams.get('category')) {
        query = query.eq('category', searchParams.get('category'));
      }

      // Execute query
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }

      setNotes(data || []);
      setLoading(false);
    };

    fetchNotes();
  }, [searchParams]);

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
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>戻る</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">「{query}」の検索結果</h2>
          </div>

          <SearchBar initialQuery={query} className="max-w-2xl" />

          {/* Results Count */}
          <p className="text-gray-600 mt-6">
            {notes.length}件の商品が見つかりました
            {selectedCategory && (
              <span className="ml-2 text-purple-600">
                （{categories.find(c => c.id === selectedCategory)?.label}）
              </span>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">検索結果が見つかりませんでした</h3>
            <p className="text-gray-600">検索条件を変更して、もう一度お試しください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              const averageRating = note.ratings && note.ratings.length > 0
                ? note.ratings.reduce((acc, r) => acc + r.rating, 0) / note.ratings.length
                : 0;

              const CategoryIcon = categories.find(c => c.id === note.category)?.icon || Tag;
              const previewImage = note.preview_images?.[0] || note.preview_url;

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {previewImage ? (
                    <div 
                      className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(previewImage);
                      }}
                    >
                      <img
                        src={previewImage}
                        alt={note.title}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
                      <CategoryIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <Link to={`/notes/${note.id}`}>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {note.university} - {note.subject}
                      </p>
                      <div className="flex items-center justify-between">
                        <RatingStars
                          rating={averageRating}
                          size="sm"
                          showCount
                          count={note.ratings?.length || 0}
                        />
                        <p className="text-lg font-bold text-purple-600">
                          ¥{note.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default SearchResults;
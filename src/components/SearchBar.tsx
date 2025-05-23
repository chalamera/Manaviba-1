import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, BookOpen, FileText, FileSpreadsheet, Mic, Tag } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

const SearchBar = ({ initialQuery = '', className = '' }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const categories = [
    { id: 'lecture_note', label: '講義ノート', icon: BookOpen },
    { id: 'past_exam', label: '過去問', icon: FileText },
    { id: 'summary', label: '資料まとめ', icon: FileSpreadsheet },
    { id: 'recording', label: '講義録音', icon: Mic },
    { id: 'other', label: 'その他', icon: Tag },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (selectedCategory) {
        params.set('category', selectedCategory);
      }
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get('category') === categoryId) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    navigate(`/search?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    navigate(`/search?${params.toString()}`);
    setIsFilterOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="買いたい資料を探す"
              className="w-full pl-12 pr-24 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm"
            />
            <Search className="absolute left-4 text-gray-400 h-5 w-5 pointer-events-none" />
            <div className="absolute right-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="p-2 text-gray-500 hover:text-purple-600 transition-colors relative"
                title="フィルター"
              >
                <Filter className="h-5 w-5" />
                {selectedCategory && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full" />
                )}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium
                  hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                検索
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsFilterOpen(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">フィルター</h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">カテゴリ</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {categories.map(({ id, label, icon: Icon }) => (
                            <button
                              key={id}
                              onClick={() => handleCategoryClick(id)}
                              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                                selectedCategory === id
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="flex-1 text-left">{label}</span>
                              {selectedCategory === id && (
                                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">✓</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  フィルターをクリア
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
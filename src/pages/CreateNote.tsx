import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Upload, Link as LinkIcon, Image as ImageIcon, FileText, Music, BookOpen, School, Building2, GraduationCap, Pen, Tag, X } from 'lucide-react';

const CreateNote = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    university: '',
    department: '',
    subject: '',
    professor: '',
    category: 'lecture_note' as 'lecture_note' | 'past_exam' | 'summary' | 'recording' | 'other',
    price: '',
    fileType: 'file' as 'file' | 'link',
    file: null as File | null,
    fileUrl: '',
    previewImages: [] as File[],
  });

  const categories = [
    { id: 'lecture_note', label: '講義ノート', icon: BookOpen },
    { id: 'past_exam', label: '過去問', icon: FileText },
    { id: 'summary', label: '資料まとめ', icon: FileText },
    { id: 'recording', label: '講義録音', icon: Music },
    { id: 'other', label: 'その他', icon: Tag },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/login');
        return;
      }

      let fileUrl = formData.fileType === 'link' ? formData.fileUrl : null;
      let previewUrls: string[] = [];

      if (formData.fileType === 'file' && formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: fileError } = await supabase.storage
          .from('notes')
          .upload(`files/${fileName}`, formData.file, {
            contentType: formData.file.type,
            upsert: false
          });

        if (fileError) throw new Error('ファイルのアップロードに失敗しました。');
        
        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(`files/${fileName}`);
        fileUrl = publicUrl;
      }

      // Upload preview images
      for (const previewFile of formData.previewImages) {
        const previewExt = previewFile.name.split('.').pop();
        const previewName = `${crypto.randomUUID()}.${previewExt}`;
        const { error: previewError } = await supabase.storage
          .from('notes')
          .upload(`previews/${previewName}`, previewFile, {
            contentType: previewFile.type,
            upsert: false
          });

        if (previewError) throw new Error('プレビュー画像のアップロードに失敗しました。');

        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(`previews/${previewName}`);
        previewUrls.push(publicUrl);
      }

      const { data: note, error: noteError } = await supabase.from('notes').insert({
        title: formData.title,
        description: formData.description,
        university: formData.university,
        department: formData.department,
        subject: formData.subject,
        professor: formData.professor,
        category: formData.category,
        price: parseInt(formData.price),
        file_url: fileUrl,
        preview_url: previewUrls[0] || null,
        preview_images: previewUrls,
        seller_id: user.id,
      }).select().single();

      if (noteError) throw new Error('商品の作成に失敗しました。');

      navigate(`/notes/${note.id}`);
    } catch (error) {
      console.error('Error creating note:', error);
      setError(error instanceof Error ? error.message : '商品の作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError('プレビュー画像は最大5枚までアップロードできます。');
      return;
    }
    setFormData(prev => ({ ...prev, previewImages: [...prev.previewImages, ...files].slice(0, 5) }));
  };

  const removePreviewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }));
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3366CC] to-blue-600 rounded-xl shadow-lg mb-4">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">商品を出品する</h1>
          <p className="text-sm sm:text-base text-gray-600">あなたの学びを共有して、収益化しましょう</p>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl shadow-sm text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Category Selection - Mobile Grid */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-[#3366CC]" />
              <span>カテゴリ</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: id as typeof formData.category })}
                  className={`p-3 sm:p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    formData.category === id
                      ? 'border-[#3366CC] bg-blue-50 text-[#3366CC] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#3366CC]" />
              <span>基本情報</span>
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                placeholder="例：線形代数学 中間試験対策ノート"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                placeholder="商品の詳細な説明を入力してください"
              />
            </div>
          </div>

          {/* Academic Information - Mobile Grid */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <School className="w-5 h-5 text-[#3366CC]" />
              <span>学術情報</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  大学
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                    placeholder="例：東京大学"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学部・学科
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                    placeholder="例：工学部情報工学科"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  科目
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                    placeholder="例：データ構造とアルゴリズム"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  担当教授
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                    placeholder="例：山田太郎"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                価格（円）
              </label>
              <div className="relative">
                <Pen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="例：1000"
                />
              </div>
            </div>
          </div>

          {/* File Upload Section - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-[#3366CC]" />
              <span>ファイルアップロード</span>
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                商品の形式
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fileType: 'file', fileUrl: '' })}
                  className={`p-4 sm:p-6 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                    formData.fileType === 'file'
                      ? 'border-[#3366CC] bg-blue-50 text-[#3366CC] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="font-medium text-sm sm:text-base">ファイルをアップロード</span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    PDF, 画像, 音声ファイルなど
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fileType: 'link', file: null })}
                  className={`p-4 sm:p-6 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                    formData.fileType === 'link'
                      ? 'border-[#3366CC] bg-blue-50 text-[#3366CC] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="font-medium text-sm sm:text-base">リンクを共有</span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Google Drive, Dropboxなど
                  </span>
                </button>
              </div>
            </div>

            {formData.fileType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ファイルをアップロード
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 transition-all duration-200 hover:border-[#3366CC] hover:bg-blue-50">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.mp3,.wav,.m4a,.ogg,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="note-file"
                    capture="environment"
                  />
                  <label
                    htmlFor="note-file"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-12 h-12 sm:h-16 sm:w-16 text-[#3366CC]" />
                    <span className="mt-4 text-sm sm:text-base text-gray-600">
                      タップしてファイルを選択
                    </span>
                    {formData.file && (
                      <div className="mt-4 sm:mt-6 flex items-center space-x-3 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        {getFileTypeIcon(formData.file.type)}
                        <span className="text-sm font-medium">{formData.file.name}</span>
                      </div>
                    )}
                  </label>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  対応形式: PDF, Word文書, 画像ファイル (JPG, PNG, GIF), 音声ファイル (MP3, WAV, M4A, OGG)
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ファイルへのリンク
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3366CC] focus:border-transparent transition-all duration-200 text-base"
                  />
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Google Drive, Dropbox, OneDriveなどの共有リンクを入力してください
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プレビュー画像（最大5枚）
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 transition-all duration-200 hover:border-[#3366CC] hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePreviewImages}
                  className="hidden"
                  id="preview-files"
                  multiple
                  capture="environment"
                />
                <label
                  htmlFor="preview-files"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-[#3366CC]" />
                  <span className="mt-4 text-sm sm:text-base text-gray-600">
                    タップして画像を選択（最大5枚）
                  </span>
                </label>

                {formData.previewImages.length > 0 && (
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {formData.previewImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                対応形式: JPG, PNG, GIF（1枚あたり最大5MB）
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3366CC] to-blue-600 text-white py-4 px-6 rounded-xl font-medium
              hover:from-[#2952A3] hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-[#3366CC] focus:ring-offset-2
              transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 shadow-lg text-base sm:text-lg"
          >
            {loading ? '作成中...' : '出品する'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNote;
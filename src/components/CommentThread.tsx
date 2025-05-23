import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  note: {
    seller_id: string;
  };
  replies?: Comment[];
}

interface CommentThreadProps {
  noteId: string;
}

const CommentThread = ({ noteId }: CommentThreadProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // First fetch the note to get the seller_id
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('seller_id')
        .eq('id', noteId)
        .single();

      if (noteError) {
        console.error('Error fetching note:', noteError);
        return;
      }

      setSellerId(noteData.seller_id);

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          note:notes(seller_id)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      // Organize comments into threads
      const threads = data.reduce((acc: { [key: string]: Comment[] }, comment: Comment) => {
        if (!comment.parent_id) {
          if (!acc.root) acc.root = [];
          acc.root.push({ ...comment, replies: [] });
        } else {
          if (!acc[comment.parent_id]) acc[comment.parent_id] = [];
          acc[comment.parent_id].push(comment);
        }
        return acc;
      }, {});

      // Attach replies to parent comments
      const rootComments = threads.root || [];
      rootComments.forEach((comment: Comment) => {
        comment.replies = threads[comment.id] || [];
      });

      setComments(rootComments);
    };

    fetchComments();
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    try {
      setLoading(true);

      if (!currentUser) {
        throw new Error('ログインが必要です');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          note_id: noteId,
          user_id: currentUser.id,
          content: newComment.trim(),
          parent_id: parentId
        })
        .select(`
          *,
          note:notes(seller_id)
        `)
        .single();

      if (error) throw error;

      if (parentId) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data]
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => [...prev, { ...data, replies: [] }]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string, parentId: string | null = null) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      if (parentId) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== commentId) || []
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getUserRole = (userId: string) => {
    if (userId === sellerId) {
      return {
        label: '出品者',
        className: 'bg-purple-100 text-purple-800'
      };
    }
    return {
      label: '質問者',
      className: 'bg-blue-100 text-blue-800'
    };
  };

  const CommentItem = ({ comment, parentId = null }: { comment: Comment; parentId?: string | null }) => {
    const role = getUserRole(comment.user_id);
    
    return (
      <div className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${role.className}`}>
                {role.label}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { locale: ja, addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Reply className="w-4 h-4" />
                <span>返信</span>
              </button>
              {currentUser?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id, parentId)}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>削除</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {replyTo === comment.id && (
          <form
            onSubmit={(e) => handleSubmit(e, comment.id)}
            className="mt-4 pl-4 border-l-2 border-gray-200"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="返信を入力..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={2}
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setNewComment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                返信する
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} parentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <MessageSquare className="w-5 h-5" />
        <span>コメント</span>
      </h2>

      {currentUser ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              投稿する
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center py-4 text-gray-600">
          コメントを投稿するには
          <a href="/login" className="text-indigo-600 hover:text-indigo-500 mx-1">
            ログイン
          </a>
          してください
        </p>
      )}

      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentThread;
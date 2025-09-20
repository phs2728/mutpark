'use client';

import { useState, useEffect } from 'react';
import { Send, Reply, Heart, MoreVertical } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  likesCount: number;
  parentId?: number | null;
  user: {
    id: number;
    name: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId, fetchComments]);

  const fetchComments = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();

      // Organize comments into parent-child structure
      const commentMap = new Map<number, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comment objects
      data.forEach((comment: Comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into hierarchy
      data.forEach((comment: Comment) => {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies!.push(commentObj);
          }
        } else {
          rootComments.push(commentObj);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content: string, parentId?: number) => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // TODO: Get from auth context
          content: content.trim(),
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      // Refresh comments
      await fetchComments();

      // Clear forms
      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/community/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1 }), // TODO: Get from auth context
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      // Refresh comments to update like counts
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {comment.user.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-medium text-gray-900">{comment.user.name}</h5>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <MoreVertical className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center space-x-4 mt-2 ml-4">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>답글</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 ml-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`${comment.user.name}님에게 답글...`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !submitting) {
                      handleSubmitComment(replyText, comment.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleSubmitComment(replyText, comment.id)}
                  disabled={!replyText.trim() || submitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">
            댓글 {comments.length > 0 && `(${comments.length})`}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* New Comment Form */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              나
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleSubmitComment(newComment)}
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? '게시 중...' : '댓글 쓰기'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-2xl h-16 mb-2"></div>
                  <div className="flex space-x-4">
                    <div className="bg-gray-200 rounded h-4 w-12"></div>
                    <div className="bg-gray-200 rounded h-4 w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm mb-2">아직 댓글이 없습니다</div>
            <div className="text-gray-500 text-xs">첫 번째 댓글을 작성해보세요!</div>
          </div>
        ) : (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
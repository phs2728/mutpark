'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Reply, Heart, MoreVertical } from 'lucide-react';
import MentionTextArea from './MentionTextArea';

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
  isLiked?: boolean;
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
  const [newCommentMentions, setNewCommentMentions] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyMentions, setReplyMentions] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
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
  }, [postId]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  const handleSubmitComment = async (content: string, mentions: number[], parentId?: number) => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
          mentions,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          return;
        }
        throw new Error('Failed to post comment');
      }

      // Refresh comments
      await fetchComments();

      // Clear forms
      if (parentId) {
        setReplyText('');
        setReplyMentions([]);
        setReplyingTo(null);
      } else {
        setNewComment('');
        setNewCommentMentions([]);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    // find target and optimistic toggle
    const target = comments.flatMap(c => [c, ...(c.replies || [])]).find(c => c.id === commentId);
    const currentlyLiked = target?.isLiked ?? false;
    const optimisticDelta = currentlyLiked ? -1 : 1;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, isLiked: !currentlyLiked, likesCount: Math.max(0, c.likesCount + optimisticDelta) };
      }
      if (c.replies && c.replies.length) {
        return {
          ...c,
          replies: c.replies.map(r => r.id === commentId ? { ...r, isLiked: !currentlyLiked, likesCount: Math.max(0, r.likesCount + optimisticDelta) } : r)
        };
      }
      return c;
    }));

    try {
      const method = currentlyLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/community/comments/${commentId}/like`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      const data = await response.json();
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: data.liked, likesCount: data.likesCount };
        }
        if (c.replies && c.replies.length) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? { ...r, isLiked: data.liked, likesCount: data.likesCount } : r)
          };
        }
        return c;
      }));
    } catch (error) {
      // rollback
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: currentlyLiked, likesCount: Math.max(0, c.likesCount - optimisticDelta) };
        }
        if (c.replies && c.replies.length) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? { ...r, isLiked: currentlyLiked, likesCount: Math.max(0, r.likesCount - optimisticDelta) } : r)
          };
        }
        return c;
      }));
      console.error('Error toggling comment like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
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
              <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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
                <div className="flex-1">
                  <MentionTextArea
                    value={replyText}
                    onChange={(value, mentions) => {
                      setReplyText(value);
                      setReplyMentions(mentions);
                    }}
                    placeholder={`${comment.user.name}님에게 답글... (@를 입력하여 사용자 멘션)`}
                    rows={2}
                    className="rounded-full text-sm"
                  />
                </div>
                <button
                  onClick={() => handleSubmitComment(replyText, replyMentions, comment.id)}
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
              <MentionTextArea
                value={newComment}
                onChange={(value, mentions) => {
                  setNewComment(value);
                  setNewCommentMentions(mentions);
                }}
                placeholder="댓글을 작성해주세요... (@를 입력하여 사용자 멘션)"
                rows={3}
                className="rounded-2xl"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleSubmitComment(newComment, newCommentMentions)}
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
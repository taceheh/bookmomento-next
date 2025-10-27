'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, CommentFormData } from '@/lib/schemas';

import { CommentItemType } from '@/types/comment';
import axios from 'axios';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CommentListClientProps {
  bookId: string;
  initialComments: CommentItemType[];
  initialCommentCount: number;
}

export default function CommentListClient({
  bookId,
  initialComments,
  initialCommentCount,
}: CommentListClientProps) {
  const id = bookId;
  const [count, setCount] = useState(initialCommentCount);
  const [comments, setComments] = useState<CommentItemType[]>(initialComments);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const refreshComments = async () => {
    const res = await fetch(
      `/api/book/${encodeURIComponent(id)}/comments?parent_id=null`,
    );
    const data = await res.json();
    setComments(data.items);
    setCount(data.totalCount);
  };

  const onValidSubmit = async (data: CommentFormData) => {
    setSubmitError(null);
    try {
      await axios.post(`/api/book/${encodeURIComponent(id)}/comments`, {
        parent_id: null,
        body: data.body,
      });
      reset(); // 폼 초기화
      refreshComments(); // 목록 새로고침
    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      setSubmitError(
        error.response?.data?.error || '댓글 작성 중 오류가 발생했습니다.',
      );
    }
  };

  return (
    <>
      <div className="pb-10">리뷰 ({count}) </div>

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-2">
        <textarea
          placeholder="리뷰를 입력하세요"
          className={`w-full h-20 border rounded-lg p-2 align-top pt-2 ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
          {...register('body')}
          disabled={isSubmitting}
        />
        {errors.body && (
          <p className="text-sm text-red-600">{errors.body.message}</p>
        )}
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <Button
          type="submit"
          variant="outline"
          size="full"
          isLoading={isSubmitting}
          loadingText="작성 중..."
        >
          리뷰 작성
        </Button>
      </form>

      <CommentList
        bookIsbn={id}
        roots={comments}
        onCommentChange={refreshComments}
      />
    </>
  );
}

function CommentList({
  bookIsbn,
  roots,
  onCommentChange, // 루트 댓글 변경 콜백
}: {
  bookIsbn: string;
  roots: CommentItemType[];
  onCommentChange: () => void;
}) {
  return (
    <ul className="mt-6 space-y-6">
      {roots.map((c) => (
        <li key={c.id}>
          <CommentItem
            bookIsbn={bookIsbn}
            comment={c}
            depth={0}
            onCommentChange={onCommentChange}
          />
        </li>
      ))}
    </ul>
  );
}

function CommentItem({
  bookIsbn,
  comment,
  depth,
  onCommentChange, // 루트 댓글 변경 콜백
}: {
  bookIsbn: string;
  comment: CommentItemType;
  depth: number;
  onCommentChange: () => void;
}) {
  const [openReplies, setOpenReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState<CommentItemType[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replySubmitError, setReplySubmitError] = useState<string | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const canReply = depth < 1;

  const {
    register: registerReply,
    handleSubmit: handleSubmitReply,
    reset: resetReply,
    formState: { errors: errorsReply, isSubmitting: isSubmittingReply },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: comment.body }, // 초기값은 현재 댓글 내용
  });

  const loadReplies = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/book/${encodeURIComponent(bookIsbn)}/comments?parent_id=${comment.id}`,
    );
    const j = await res.json();
    setReplies(j.items ?? []);
    setLoading(false);
  };

  const toggleReplies = async () => {
    if (!openReplies) {
      if (!replies) await loadReplies();
      setOpenReplies(true);
    } else {
      setOpenReplies(false);
    }
  };

  const onValidSubmitReply = async (data: CommentFormData) => {
    setReplySubmitError(null);
    try {
      await axios.post(`/api/book/${encodeURIComponent(bookIsbn)}/comments`, {
        parent_id: comment.id,
        body: data.body,
      });
      resetReply();
      await loadReplies(); // 답글 목록 새로고침
      setOpenReplies(true);
      setReplyOpen(false);
    } catch (error: any) {
      console.error('답글 작성 실패:', error);
      setReplySubmitError(
        error.response?.data?.error || '답글 작성 중 오류가 발생했습니다.',
      );
    }
  };

  const onValidSubmitEdit = async (data: CommentFormData) => {
    setEditSubmitError(null);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${comment.id}`,
        { body: data.body },
      );
      setIsEditing(false);

      if (comment.parent_id === null) {
        onCommentChange();
      } else {
        console.warn('대댓글 수정 후 리프레시 로직 필요');
        handleRefreshReplies();
      }
    } catch (error: any) {
      console.error('댓글 수정 실패:', error);
      setEditSubmitError(
        error.response?.data?.error || '댓글 수정 중 오류가 발생했습니다.',
      );
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${comment.id}`,
      );
      if (comment.parent_id === null) {
        onCommentChange();
      } else {
        console.warn('대댓글 삭제 후 리프레시 로직 필요');
        handleRefreshReplies(); // 임시
      }
    } catch (error: any) {
      console.error('댓글 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshReplies = () => {
    if (replies !== null) {
      loadReplies();
    }
  };

  return (
    <div className="rounded-xl p-4 border">
      <div className="text-xs text-gray-500">
        작성자: {comment.user_id ? comment.user_id.slice(0, 8) : '탈퇴한 회원'}{' '}
        · {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmitEdit(onValidSubmitEdit)}
          className="mt-2 space-y-2"
        >
          <textarea
            className={`w-full rounded-lg border p-2 text-sm ${errorsEdit.body ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            {...registerEdit('body')}
            disabled={isSubmittingEdit}
          />
          {errorsEdit.body && (
            <p className="text-xs text-red-600">{errorsEdit.body.message}</p>
          )}
          {editSubmitError && (
            <p className="text-xs text-red-600">{editSubmitError}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingEdit}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetEdit({ body: comment.body }); // 취소 시 원래 내용으로 리셋
              }}
              variant="secondary"
              disabled={isSubmittingEdit}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-2 whitespace-pre-wrap">
          {comment.deleted_at ? (
            <span className="text-gray-400 italic">삭제된 댓글입니다</span>
          ) : (
            comment.body
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-sm">
        {canReply && !comment.deleted_at && (
          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            className="underline hover:text-blue-600"
          >
            {replyOpen ? '답글 취소' : '답글 쓰기'}
          </button>
        )}
        <button
          type="button"
          onClick={toggleReplies}
          className="underline hover:text-blue-600"
        >
          {openReplies ? '답글 접기' : '답글 보기'}
        </button>

        {!comment.deleted_at &&
          !isEditing && ( // 수정 중일 때는 버튼 숨김
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => {
                  setIsEditing(true);
                  resetEdit({ body: comment.body });
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs"
              >
                <Edit className="w-3 h-3" /> 수정
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />{' '}
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}
      </div>

      {replyOpen && canReply && (
        <form
          onSubmit={handleSubmitReply(onValidSubmitReply)}
          className="mt-3 space-y-2"
        >
          <textarea
            className={`w-full rounded-lg border p-2 ${errorsReply.body ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            placeholder="답글을 입력하세요"
            {...registerReply('body')}
            disabled={isSubmittingReply}
          />
          {errorsReply.body && (
            <p className="text-xs text-red-600">{errorsReply.body.message}</p>
          )}
          {replySubmitError && (
            <p className="text-xs text-red-600">{replySubmitError}</p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingReply}
              loadingText="등록 중..."
            >
              등록
            </Button>
            <Button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                resetReply(); // 취소 시 폼 리셋
              }}
              variant="secondary"
              disabled={isSubmittingReply}
            >
              취소
            </Button>
          </div>
        </form>
      )}

      {openReplies && (
        <div className="mt-3 pl-4 border-l">
          {loading && <div>답글 불러오는 중...</div>}
          {!loading && replies?.length === 0 && <div>아직 답글이 없습니다</div>}
          {!loading &&
            replies &&
            replies.map((r) => (
              <ReplyItem
                key={r.id}
                bookIsbn={bookIsbn}
                reply={r}
                onReplyChange={handleRefreshReplies}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  bookIsbn,
  reply,
  onReplyChange,
}: {
  bookIsbn: string;
  reply: CommentItemType;
  onReplyChange: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: reply.body }, // 초기값은 현재 답글 내용
  });

  const onValidSubmitEdit = async (data: CommentFormData) => {
    setEditSubmitError(null);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${reply.id}`,
        { body: data.body },
      );
      setIsEditing(false);
      onReplyChange();
    } catch (error: any) {
      console.error('답글 수정 실패:', error);
      setEditSubmitError(
        error.response?.data?.error || '답글 수정 중 오류가 발생했습니다.',
      );
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${reply.id}`,
      );
      onReplyChange();
    } catch (error: any) {
      console.error('답글 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-xl p-3 border bg-gray-50 mt-2">
      <div className="text-xs text-gray-500">
        작성자: {reply.user_id?.slice(0, 8) ?? '익명'} ·{' '}
        {dayjs(reply.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmitEdit(onValidSubmitEdit)}
          className="mt-2 space-y-2"
        >
          <textarea
            className={`w-full rounded-lg border p-2 text-sm bg-white ${errorsEdit.body ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            {...registerEdit('body')}
            disabled={isSubmittingEdit}
          />
          {errorsEdit.body && (
            <p className="text-xs text-red-600">{errorsEdit.body.message}</p>
          )}
          {editSubmitError && (
            <p className="text-xs text-red-600">{editSubmitError}</p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingEdit}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetEdit({ body: reply.body }); // 취소 시 원래 내용으로 리셋
              }}
              variant="secondary"
              disabled={isSubmittingEdit}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-1 whitespace-pre-wrap">
          {reply.deleted_at ? (
            <span className="text-gray-400 italic">삭제된 댓글입니다</span>
          ) : (
            reply.body
          )}
        </div>
      )}

      {!isEditing &&
        !reply.deleted_at && ( // 수정 중, 삭제된 댓글 제외
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(true);
                resetEdit({ body: reply.body });
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs"
            >
              <Edit className="w-3 h-3" /> 수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />{' '}
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
    </div>
  );
}

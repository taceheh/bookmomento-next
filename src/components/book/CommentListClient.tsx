'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, CommentFormData } from '@/lib/schemas';
import { CommentItemType } from '@/types/comment';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  addComment,
  editComment,
  deleteComment,
} from '@/app/(main)/book/[id]/actions';

import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [count, setCount] = useState(initialCommentCount);
  const [comments, setComments] = useState<CommentItemType[]>(initialComments);
  const [isPendingAdd, startTransitionAdd] = useTransition();

  const { user, loading: authLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const onValidSubmit = async (data: CommentFormData) => {
    if (authLoading) return;
    if (!user) {
      toast.error('로그인이 필요한 기능입니다.', {
        action: {
          label: '로그인',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionAdd(async () => {
      const result = await addComment(bookId, null, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        reset();
        setCount((prev) => prev + 1);
        router.refresh();
      } else {
        toast.error('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  useEffect(() => {
    setComments(initialComments);
    setCount(initialCommentCount);
  }, [initialComments, initialCommentCount]);

  return (
    <>
      <div className="pb-10">리뷰 ({count}) </div>

      {authLoading ? (
        <div className="w-full h-36 border rounded-lg p-2 bg-gray-100 animate-pulse" />
      ) : user ? (
        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-2">
          <textarea
            placeholder="리뷰를 입력하세요"
            className={`w-full h-20 border rounded-lg p-2 align-top pt-2 ${
              errors.body ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('body')}
            disabled={isPendingAdd}
          />
          {errors.body && (
            <p className="text-sm text-red-600">{errors.body.message}</p>
          )}
          <Button
            type="submit"
            variant="outline"
            size="full"
            isLoading={isPendingAdd}
            loadingText="작성 중..."
          >
            리뷰 작성
          </Button>
        </form>
      ) : (
        <div className="w-full h-36 border rounded-lg p-4 text-center text-gray-500 bg-gray-50 flex items-center justify-center">
          <Button onClick={() => router.push('/signin')}>
            로그인하고 리뷰를 작성해보세요.
          </Button>
        </div>
      )}

      <CommentList bookIsbn={bookId} roots={comments} user={user} />
    </>
  );
}

function CommentList({
  bookIsbn,
  roots,
  user,
}: {
  bookIsbn: string;
  roots: CommentItemType[];
  user: any | null;
}) {
  return (
    <ul className="mt-6 space-y-6">
      {roots.map((c) => (
        <li key={c.id}>
          <CommentItem bookIsbn={bookIsbn} comment={c} depth={0} user={user} />
        </li>
      ))}
    </ul>
  );
}

function CommentItem({
  bookIsbn,
  comment,
  depth,
  user,
}: {
  bookIsbn: string;
  comment: CommentItemType;
  depth: number;
  user: any | null;
}) {
  const router = useRouter();
  const authLoading = useAuthStore((state) => state.loading);

  const [openReplies, setOpenReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState<CommentItemType[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isPendingReply, startTransitionReply] = useTransition();
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const canReply = depth < 1;

  const {
    register: registerReply,
    handleSubmit: handleSubmitReply,
    reset: resetReply,
    formState: { errors: errorsReply },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: comment.body },
  });

  const loadReplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?parent_id=${
          comment.id
        }`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch replies: ${res.status}`);
      }
      const j = await res.json();
      setReplies(j.items ?? []);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('답글을 불러오는 중 오류가 발생했습니다.');
      setReplies([]);
    } finally {
      setLoading(false);
    }
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
    if (authLoading) return;
    if (!user) {
      toast.error('로그인이 필요한 기능입니다.', {
        action: {
          label: '로그인',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionReply(async () => {
      const result = await addComment(bookIsbn, comment.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        resetReply();
        setReplyOpen(false);
        router.refresh();
        if (!openReplies) await loadReplies();
        setOpenReplies(true);
      } else {
        toast.error('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const onValidSubmitEdit = async (data: CommentFormData) => {
    if (authLoading) return;
    if (!user || user.id !== comment.user_id) {
      toast.error('수정할 권한이 없습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionEdit(async () => {
      const result = await editComment(bookIsbn, comment.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = async () => {
    if (authLoading) return;
    if (!user || user.id !== comment.user_id) {
      toast.error('삭제할 권한이 없습니다.');
      return;
    }

    if (
      !window.confirm('댓글을 정말 삭제하시겠습니까? 답글도 모두 삭제됩니다.')
    ) {
      return;
    }

    startTransitionDelete(async () => {
      const result = await deleteComment(bookIsbn, comment.id);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('댓글이 삭제되었습니다.');
        router.refresh();
      }
    });
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
            className={`w-full rounded-lg border p-2 text-sm ${
              errorsEdit.body ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            {...registerEdit('body')}
            disabled={isPendingEdit}
          />
          {errorsEdit.body && (
            <p className="text-xs text-red-600">{errorsEdit.body.message}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPendingEdit}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetEdit({ body: comment.body });
              }}
              variant="secondary"
              disabled={isPendingEdit}
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
        {user && canReply && !comment.deleted_at && (
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
        {user?.id === comment.user_id && !comment.deleted_at && !isEditing && (
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
              disabled={isPendingDelete}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />{' '}
              {isPendingDelete ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {replyOpen && canReply && user && (
        <form
          onSubmit={handleSubmitReply(onValidSubmitReply)}
          className="mt-3 space-y-2"
        >
          <textarea
            className={`w-full rounded-lg border p-2 ${
              errorsReply.body ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="답글을 입력하세요"
            {...registerReply('body')}
            disabled={isPendingReply}
          />
          {errorsReply.body && (
            <p className="text-xs text-red-600">{errorsReply.body.message}</p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPendingReply}
              loadingText="등록 중..."
            >
              등록
            </Button>
            <Button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                resetReply();
              }}
              variant="secondary"
              disabled={isPendingReply}
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
                refreshReplies={loadReplies}
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
  refreshReplies,
}: {
  bookIsbn: string;
  reply: CommentItemType;
  refreshReplies: () => Promise<void>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const { user, loading: authLoading } = useAuthStore();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: reply.body },
  });

  const onValidSubmitEdit = async (data: CommentFormData) => {
    if (authLoading) return;
    if (!user || user.id !== reply.user_id) {
      toast.error('수정할 권한이 없습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionEdit(async () => {
      const result = await editComment(bookIsbn, reply.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setIsEditing(false);
        toast.success('답글이 수정되었습니다.');
        await refreshReplies(); // 클라이언트 답글 목록 즉시 갱신
      } else {
        toast.error('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = async () => {
    if (authLoading) return;
    if (!user || user.id !== reply.user_id) {
      toast.error('삭제할 권한이 없습니다.');
      return;
    }

    if (!window.confirm('답글을 정말 삭제하시겠습니까?')) {
      return;
    }

    startTransitionDelete(async () => {
      const result = await deleteComment(bookIsbn, reply.id);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('답글이 삭제되었습니다.');
        await refreshReplies(); // 클라이언트 답글 목록 즉시 갱신
      }
    });
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
            className={`w-full rounded-lg border p-2 text-sm bg-white ${
              errorsEdit.body ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            {...registerEdit('body')}
            disabled={isPendingEdit}
          />
          {errorsEdit.body && (
            <p className="text-xs text-red-600">{errorsEdit.body.message}</p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPendingEdit}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetEdit({ body: reply.body });
              }}
              variant="secondary"
              disabled={isPendingEdit}
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

      {!isEditing && !reply.deleted_at && user?.id === reply.user_id && (
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
            disabled={isPendingDelete}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />{' '}
            {isPendingDelete ? '삭제 중...' : '삭제'}
          </button>
        </div>
      )}
    </div>
  );
}

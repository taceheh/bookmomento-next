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
} from '@/app/book/[id]/actions';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPendingAdd, startTransitionAdd] = useTransition();

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
    setSubmitError(null);
    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionAdd(async () => {
      const result = await addComment(bookId, null, formData);
      if (result?.error) {
        setSubmitError(result.error);
      } else if (result?.success) {
        reset();
        setCount((prev) => prev + 1);
        router.refresh();
      } else {
        setSubmitError('알 수 없는 오류가 발생했습니다.');
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

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-2">
        <textarea
          placeholder="리뷰를 입력하세요"
          className={`w-full h-20 border rounded-lg p-2 align-top pt-2 ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
          {...register('body')}
          disabled={isPendingAdd}
        />
        {errors.body && (
          <p className="text-sm text-red-600">{errors.body.message}</p>
        )}
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
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

      <CommentList bookIsbn={bookId} roots={comments} />
    </>
  );
}

function CommentList({
  bookIsbn,
  roots,
}: {
  bookIsbn: string;
  roots: CommentItemType[];
}) {
  return (
    <ul className="mt-6 space-y-6">
      {roots.map((c) => (
        <li key={c.id}>
          <CommentItem bookIsbn={bookIsbn} comment={c} depth={0} />
        </li>
      ))}
    </ul>
  );
}

function CommentItem({
  bookIsbn,
  comment,
  depth,
}: {
  bookIsbn: string;
  comment: CommentItemType;
  depth: number;
}) {
  const router = useRouter();
  const [openReplies, setOpenReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState<CommentItemType[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isPendingReply, startTransitionReply] = useTransition();
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const [replySubmitError, setReplySubmitError] = useState<string | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?parent_id=${comment.id}`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch replies: ${res.status}`);
      }
      const j = await res.json();
      setReplies(j.items ?? []);
    } catch (error) {
      console.error('Error loading replies:', error);
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
    setReplySubmitError(null);
    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionReply(async () => {
      const result = await addComment(bookIsbn, comment.id, formData);
      if (result?.error) {
        setReplySubmitError(result.error);
      } else if (result?.success) {
        resetReply();
        setReplyOpen(false);
        router.refresh();
        if (!openReplies) await loadReplies();
        setOpenReplies(true);
      } else {
        setReplySubmitError('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const onValidSubmitEdit = async (data: CommentFormData) => {
    setEditSubmitError(null);
    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionEdit(async () => {
      const result = await editComment(bookIsbn, comment.id, formData);
      if (result?.error) {
        setEditSubmitError(result.error);
      } else if (result?.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setEditSubmitError('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = async () => {
    setDeleteError(null);
    startTransitionDelete(async () => {
      const result = await deleteComment(bookIsbn, comment.id);
      if (result?.error) {
        setDeleteError(result.error);
      } else if (result?.success) {
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
            className={`w-full rounded-lg border p-2 text-sm ${errorsEdit.body ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            {...registerEdit('body')}
            disabled={isPendingEdit}
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
        {!comment.deleted_at && !isEditing && (
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
      {deleteError && (
        <p className="text-xs text-red-600 mt-1">{deleteError}</p>
      )}

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
            disabled={isPendingReply}
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
                refreshReplies={loadReplies} // loadReplies 함수 전달
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
  refreshReplies, // refreshReplies prop 추가
}: {
  bookIsbn: string;
  reply: CommentItemType;
  refreshReplies: () => Promise<void>; // prop 타입 정의
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setEditSubmitError(null);
    const formData = new FormData();
    formData.append('body', data.body);

    startTransitionEdit(async () => {
      const result = await editComment(bookIsbn, reply.id, formData);
      if (result?.error) {
        setEditSubmitError(result.error);
      } else if (result?.success) {
        setIsEditing(false);
        router.refresh();
        await refreshReplies(); // 클라이언트 답글 목록 즉시 갱신
      } else {
        setEditSubmitError('알 수 없는 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = async () => {
    setDeleteError(null);
    startTransitionDelete(async () => {
      const result = await deleteComment(bookIsbn, reply.id);
      if (result?.error) {
        setDeleteError(result.error);
      } else if (result?.success) {
        router.refresh();
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
            className={`w-full rounded-lg border p-2 text-sm bg-white ${errorsEdit.body ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            {...registerEdit('body')}
            disabled={isPendingEdit}
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
      {deleteError && (
        <p className="text-xs text-red-600 mt-1">{deleteError}</p>
      )}

      {!isEditing && !reply.deleted_at && (
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

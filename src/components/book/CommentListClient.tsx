'use client';

import { useState } from 'react';
import { CommentItemType } from '@/types/comment';
import axios from 'axios';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

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
  const [text, setText] = useState('');
  const [count, setCount] = useState(initialCommentCount);
  const [comments, setComments] = useState<CommentItemType[]>(initialComments);

  const refreshComments = async () => {
    const res = await fetch(
      `/api/book/${encodeURIComponent(id)}/comments?parent_id=null`,
    );
    const data = await res.json();
    setComments(data.items);
    setCount(data.totalCount);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;

    await axios.post(`/api/book/${encodeURIComponent(id)}/comments`, {
      parent_id: null,
      body: text.trim(),
    });

    setText('');
    refreshComments(); // refreshComments 호출
  }

  return (
    <>
      <div className="pb-10">리뷰 ({count}) </div>
      <form onSubmit={onSubmit}>
        <input
          className="border border-[#DBDBDB] w-full h-20"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="리뷰를 입력하세요"
        />
        <Button type="submit" variant="outline" size="full" className="mt-1">
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
  onCommentChange,
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
  onCommentChange,
}: {
  bookIsbn: string;
  comment: CommentItemType;
  depth: number;
  onCommentChange: () => void;
}) {
  const [openReplies, setOpenReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommentItemType[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canReply = depth < 1;

  const loadReplies = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/book/${encodeURIComponent(bookIsbn)}/comments?parent_id=${
        comment.id
      }`,
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

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await axios.post(`/api/book/${encodeURIComponent(bookIsbn)}/comments`, {
      parent_id: comment.id,
      body: replyText.trim(),
    });
    setReplyText('');
    await loadReplies();
    setOpenReplies(true);
    setReplyOpen(false);
  };

  const handleEdit = async () => {
    if (!editText.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(
          bookIsbn,
        )}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${
          comment.id
        }`,
        {
          body: editText.trim(),
        },
      );

      setIsEditing(false);
      if (comment.parent_id === null) {
        onCommentChange(); // (루트 댓글은 부모 프롭 호출)
      } else {
        await loadReplies();
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    // if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(
          bookIsbn,
        )}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${
          comment.id
        }`,
      );

      if (comment.parent_id === null) {
        onCommentChange();
      } else {
        await loadReplies();
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      // alert('댓글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshReplies = () => {
    loadReplies();
  };

  return (
    <div className="rounded-xl p-4 border">
      <div className="text-xs text-gray-500">
        작성자: {comment.user_id ? comment.user_id.slice(0, 8) : '탈퇴한 회원'}{' '}
        · {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            className="w-full rounded-lg border p-2 text-sm"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              onClick={handleEdit}
              variant="primary"
              isLoading={isUpdating}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.body);
              }}
              variant="secondary"
            >
              취소
            </Button>
          </div>
        </div>
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

        {!comment.deleted_at && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs"
            >
              <Edit className="w-3 h-3" />
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {replyOpen && canReply && (
        <div className="mt-3">
          <textarea
            className="w-full rounded-lg border p-2"
            rows={3}
            placeholder="답글을 입력하세요"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button onClick={submitReply} variant="primary">
              등록
            </Button>
            <Button
              onClick={() => {
                setReplyOpen(false);
                setReplyText('');
              }}
              variant="secondary"
            >
              취소
            </Button>
          </div>
        </div>
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
  const [editText, setEditText] = useState(reply.body);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    if (!editText.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(
          bookIsbn,
        )}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${
          reply.id
        }`,
        {
          body: editText.trim(),
        },
      );

      setIsEditing(false);
      onReplyChange();
    } catch (error) {
      console.error('답글 수정 실패:', error);
      // alert('답글 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    // if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(
          bookIsbn,
        )}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${
          reply.id
        }`,
      );
      onReplyChange();
    } catch (error) {
      console.error('답글 삭제 실패:', error);
      // alert('답글 삭제에 실패했습니다.');
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
        <div className="mt-2">
          <textarea
            className="w-full rounded-lg border p-2 text-sm bg-white"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              onClick={handleEdit}
              variant="primary"
              isLoading={isUpdating}
              loadingText="수정 중..."
            >
              수정 완료
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditText(reply.body);
              }}
              variant="secondary"
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 whitespace-pre-wrap">
          {reply.deleted_at ? (
            <span className="text-gray-400 italic">삭제된 댓글입니다</span>
          ) : (
            reply.body
          )}
        </div>
      )}

      {!isEditing && !reply.deleted_at && (
        <div className="mt-2 flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs"
          >
            <Edit className="w-3 h-3" />
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      )}
    </div>
  );
}

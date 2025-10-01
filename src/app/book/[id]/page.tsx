'use client';

import { Book } from '@/types/book';
import axios from 'axios';
import { ThumbsDown, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);
  const [comments, setComments] = useState<CommentItemType[]>([]);
  type Reaction = 'like' | 'dislike';

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [myReaction, setMyReaction] = useState<Reaction | null>(null);
  const [reacting, setReacting] = useState(false);

  // 좋아요/싫어요 집계 + 내 상태 로드
  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const j = await res.json();
        setLikes(j.likes ?? 0);
        setDislikes(j.dislikes ?? 0);
        setMyReaction(j.myReaction ?? null);
      }
    })();
  }, [id]);

  // 책 정보 + 댓글 로드
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/book/bookdetail?isbn=${id}`);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error);
        }
        const data = await res.json();
        console.log(data);
        setBook(data);
      } catch (err: any) {
        console.error('에러:', err.message);
      }
    };

    const fetchComment = async () => {
      if (!id) return;
      const res = await fetch(
        `/api/book/${encodeURIComponent(id)}/comments?parent_id=null`,
      );
      const data = await res.json();
      setCount(data.totalCount);
      setComments(data.items);
    };

    fetchBook();
    fetchComment();
  }, [id]);

  // 댓글 등록
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;

    await axios.post(`/api/book/${encodeURIComponent(id)}/comments`, {
      parent_id: null,
      body: text.trim(),
    });

    setText('');

    const r = await fetch(
      `/api/book/${encodeURIComponent(id)}/comments?parent_id=null`,
    );
    const d = await r.json();
    setComments(d.items);
    setCount(d.totalCount);
  }

  // 좋아요/싫어요 토글
  async function toggle(reaction: Reaction) {
    if (!id || reacting) return;
    setReacting(true);

    const prev = myReaction;
    if (prev === reaction) {
      // 같은 반응 → 취소
      if (reaction === 'like') setLikes((v) => Math.max(0, v - 1));
      else setDislikes((v) => Math.max(0, v - 1));
      setMyReaction(null);
    } else if (prev == null) {
      // 새 반응
      if (reaction === 'like') setLikes((v) => v + 1);
      else setDislikes((v) => v + 1);
      setMyReaction(reaction);
    } else {
      // 반대 전환
      if (prev === 'like') {
        setLikes((v) => Math.max(0, v - 1));
        setDislikes((v) => v + 1);
      } else {
        setDislikes((v) => Math.max(0, v - 1));
        setLikes((v) => v + 1);
      }
      setMyReaction(reaction);
    }

    const res = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction }),
    });

    if (!res.ok) {
      const agg = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
        cache: 'no-store',
      });
      if (agg.ok) {
        const j = await agg.json();
        setLikes(j.likes ?? 0);
        setDislikes(j.dislikes ?? 0);
        setMyReaction(j.myReaction ?? null);
      }
    }

    setReacting(false);
  }

  // 댓글 목록 새로고침
  const refreshComments = async () => {
    const res = await fetch(
      `/api/book/${encodeURIComponent(id)}/comments?parent_id=null`,
    );
    const data = await res.json();
    setComments(data.items);
    setCount(data.totalCount);
  };

  if (!book) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="flex h-20 items-center text-sm">
        <div className="ml-2 mr-8">책정보</div>
        <div>AI 토론</div>
      </div>

      {/* 책 정보 */}
      <div className="relative w-full h-96 overflow-hidden">
        <img
          src={book?.cover}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />
        <div className="relative z-20 flex justify-center items-center h-full">
          <img
            src={book?.cover}
            alt="cover"
            className="h-88 shadow-xl rounded-md"
          />
        </div>
      </div>

      <div className="pt-10 px-6">
        <div className="text-lg font-bold">{book?.title}</div>
        <div className="text-sm pt-4">{book?.author}</div>
        <div className="text-sm pt-2">{book?.publisher}</div>
      </div>

      {/* 좋아요/싫어요 */}
      <div className="px-6 text-sm pt-4 flex pb-10 border-b border-[#DBDBDB]">
        <button
          onClick={() => toggle('like')}
          disabled={reacting}
          className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm mr-2"
        >
          <ThumbsUp
            className={`w-4 ${
              myReaction === 'like'
                ? 'text-black-600 [&_*]:fill-current'
                : 'text-gray-600 opacity-60'
            }`}
          />
          &nbsp; |<span className="ml-2">{likes}</span>
        </button>

        <button
          onClick={() => toggle('dislike')}
          disabled={reacting}
          className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm"
        >
          <ThumbsDown
            className={`w-4 ${
              myReaction === 'dislike'
                ? 'text-black-600 [&_*]:fill-current'
                : 'text-gray-600 opacity-60'
            }`}
          />{' '}
          &nbsp; |<span className="ml-2">{dislikes}</span>
        </button>
      </div>

      <div className="px-6 py-10 text-sm">{book?.description}</div>

      {/* 댓글 섹션 */}
      <div className="border-t border-[#DBDBDB] py-10 px-6">
        <div className="pb-10">리뷰 ({count}) </div>
        <form onSubmit={onSubmit}>
          <input
            className="border border-[#DBDBDB] w-full h-20"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="리뷰를 입력하세요"
          />
          <button className="block w-full text-sm p-2 text-center border mt-1">
            리뷰 작성
          </button>
        </form>
        <CommentList
          bookIsbn={id}
          roots={comments}
          onCommentChange={refreshComments}
        />
      </div>
    </div>
  );
}

// 댓글 타입 - deleted_at 필드 추가
type CommentItemType = {
  id: string;
  parent_id: string | null;
  body: string;
  user_id: string | null;
  created_at: string;
  deleted_at: string | null;
};

// 댓글 리스트
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

// 댓글 아이템
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

  // 수정 관련 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canReply = depth < 1;

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

  // 댓글 수정
  const handleEdit = async () => {
    if (!editText.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${comment.id}`,
        {
          body: editText.trim(),
        },
      );

      setIsEditing(false);
      // 부모 댓글이면 전체 목록 새로고침, 답글이면 답글 목록만 새로고침
      if (comment.parent_id === null) {
        onCommentChange();
      } else {
        await loadReplies();
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 댓글 삭제 - query parameter 방식으로 수정
  const handleDelete = async () => {
    if (isDeleting) return;

    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${comment.id}`,
      );

      // 부모 댓글이면 전체 목록 새로고침, 답글이면 답글 목록만 새로고침
      if (comment.parent_id === null) {
        onCommentChange();
      } else {
        await loadReplies();
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
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
        작성자: {comment.user_id?.slice(0, 8) ?? '익명'} ·{' '}
        {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
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
            <button
              onClick={handleEdit}
              disabled={isUpdating}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50"
            >
              {isUpdating ? '수정 중...' : '수정 완료'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.body);
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
            >
              취소
            </button>
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

        {/* 수정/삭제 버튼 - 삭제되지 않은 댓글만 */}
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
            <button
              onClick={submitReply}
              className="px-3 py-1 bg-black text-white text-sm rounded"
            >
              등록
            </button>
            <button
              onClick={() => {
                setReplyOpen(false);
                setReplyText('');
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
            >
              취소
            </button>
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

// 답글 아이템 컴포넌트 - API 호출 방식 통일
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

  // 답글 수정 - PATCH + query parameter로 통일
  const handleEdit = async () => {
    if (!editText.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await axios.patch(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${reply.id}`,
        {
          body: editText.trim(),
        },
      );

      setIsEditing(false);
      onReplyChange();
    } catch (error) {
      console.error('답글 수정 실패:', error);
      alert('답글 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 답글 삭제 - DELETE + query parameter로 통일
  const handleDelete = async () => {
    if (isDeleting) return;

    if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/book/${encodeURIComponent(bookIsbn)}/comments?book_isbn=${encodeURIComponent(bookIsbn)}&comment_id=${reply.id}`,
      );
      onReplyChange();
    } catch (error) {
      console.error('답글 삭제 실패:', error);
      alert('답글 삭제에 실패했습니다.');
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
            <button
              onClick={handleEdit}
              disabled={isUpdating}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50"
            >
              {isUpdating ? '수정 중...' : '수정 완료'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(reply.body);
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
            >
              취소
            </button>
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

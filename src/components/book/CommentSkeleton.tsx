const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export default function CommentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="pb-10">
        <SkeletonBox className="w-24 h-6" />
      </div>

      <div>
        <SkeletonBox className="w-full h-20" />
        <SkeletonBox className="w-full h-10 mt-1" />
      </div>

      <div className="space-y-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <div className="rounded-xl p-4 border space-y-3" key={i}>
            <div className="flex justify-between items-center">
              <SkeletonBox className="w-1/3 h-4" />
            </div>
            <SkeletonBox className="w-full h-12" />
            <div className="flex gap-4">
              <SkeletonBox className="w-16 h-4" />
              <SkeletonBox className="w-16 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

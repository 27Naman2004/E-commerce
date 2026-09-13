const Skeleton = ({ className }) => {
  return <div className={`skeleton ${className}`} />;
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="p-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Skeleton };
export default Skeleton;

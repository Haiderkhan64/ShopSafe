import { Skeleton } from "@/components/ui/skeleton";
export const dynamic = "force-static";

const LoadingProductPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-6 mb-32 md:mb-44">
      <div className="grid grid-cols-1 md:grid-cols-2 mx-auto max-w-7xl gap-8">
        <div className="relative h-[440px] md:h-[680px] max-w-xl overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              <Skeleton className="h-8 w-3/4" />
            </h1>
            <div className="text-2xl font-semibold mb-4">
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="prose max-w-none mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6 mb-2" />
            </div>
          </div>
          <div className="mt-6">
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingProductPage;

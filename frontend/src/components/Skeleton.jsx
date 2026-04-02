export function Skeleton({ className }) {
    return (
        <div className={`animate-shimmer rounded-xl ${className}`}></div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 h-full border-dashed opacity-50">
            <div className="flex flex-col sm:flex-row gap-6 h-full">
                {/* Image Skeleton */}
                <div className="w-full sm:w-48 h-72 sm:h-auto rounded-3xl animate-shimmer shrink-0"></div>
                
                {/* Content Skeleton */}
                <div className="flex-1 flex flex-col py-2">
                    <div className="h-8 w-3/4 animate-shimmer rounded-lg mb-4"></div>
                    <div className="h-4 w-1/2 animate-shimmer rounded-lg mb-6"></div>
                    <div className="space-y-3 mb-8">
                        <div className="h-4 w-full animate-shimmer rounded-lg"></div>
                        <div className="h-4 w-5/6 animate-shimmer rounded-lg"></div>
                    </div>
                    <div className="mt-auto h-10 w-1/3 animate-shimmer rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonStatCard() {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 opacity-50">
            <div className="w-14 h-14 rounded-xl animate-shimmer"></div>
            <div>
                <div className="h-8 w-12 animate-shimmer rounded-lg mb-2"></div>
                <div className="h-4 w-20 animate-shimmer rounded-lg"></div>
            </div>
        </div>
    );
}

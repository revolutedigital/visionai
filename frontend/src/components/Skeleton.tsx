interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Skeleton variants para componentes específicos
export function SkeletonHeroSection() {
  return (
    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-2xl p-8 animate-pulse">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={24} variant="rounded" />
            <Skeleton width={300} height={16} variant="rounded" />
          </div>
          <Skeleton width={120} height={36} variant="rounded" />
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/20 rounded-xl p-6">
              <Skeleton width={100} height={14} className="mb-4" variant="rounded" />
              <Skeleton width={80} height={40} className="mb-2" variant="rounded" />
              <Skeleton width={120} height={12} variant="rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" height={20} className="mb-2" variant="rounded" />
          <Skeleton width="80%" height={14} variant="rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton width="100%" height={60} variant="rounded" />
        <Skeleton width="100%" height={60} variant="rounded" />
      </div>
    </div>
  );
}

export function SkeletonPipelineTimeline() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="flex justify-between mb-6">
        <div>
          <Skeleton width={200} height={24} className="mb-2" variant="rounded" />
          <Skeleton width={300} height={16} variant="rounded" />
        </div>
        <Skeleton width={120} height={40} variant="rounded" />
      </div>

      <div className="flex items-center justify-around">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex-1 text-center">
              <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-3" />
              <Skeleton width={80} height={12} className="mx-auto mb-2" variant="rounded" />
              <Skeleton width={60} height={20} className="mx-auto mb-2" variant="rounded" />
              <Skeleton width={50} height={10} className="mx-auto" variant="rounded" />
            </div>
            {i < 4 && (
              <div className="flex-shrink-0 mx-4">
                <Skeleton width={48} height={4} variant="rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

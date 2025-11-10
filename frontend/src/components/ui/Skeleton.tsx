import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = false 
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    />
  );
};

// 테이블 스켈레톤
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 6 
}) => (
  <div className="space-y-3">
    {/* 헤더 */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={20} />
      ))}
    </div>
    
    {/* 행들 */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} height={16} />
        ))}
      </div>
    ))}
  </div>
);

// 카드 스켈레톤
export const CardSkeleton: React.FC = () => (
  <div className="p-6 border border-gray-200 rounded-lg space-y-4">
    <Skeleton height={24} width="60%" />
    <Skeleton height={16} width="100%" />
    <Skeleton height={16} width="80%" />
    <div className="flex space-x-2">
      <Skeleton height={32} width={80} />
      <Skeleton height={32} width={80} />
    </div>
  </div>
);

// 차트 스켈레톤
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="space-y-4">
    <Skeleton height={20} width="40%" />
    <Skeleton height={height} className="rounded-lg" />
    <div className="flex justify-center space-x-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton width={12} height={12} rounded />
          <Skeleton width={60} height={16} />
        </div>
      ))}
    </div>
  </div>
);

// 프로필 스켈레톤
export const ProfileSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4">
    <Skeleton width={48} height={48} rounded />
    <div className="space-y-2">
      <Skeleton height={16} width={120} />
      <Skeleton height={14} width={80} />
    </div>
  </div>
);
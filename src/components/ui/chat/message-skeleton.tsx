'use client';

import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from "@/contexts/ThemeContext";

interface MessageSkeletonProps {
  count?: number;
}

export function MessageSkeleton({ count = 3 }: MessageSkeletonProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <SkeletonTheme 
      baseColor={isDarkMode ? '#202020' : '#ebebeb'} 
      highlightColor={isDarkMode ? '#444' : '#f5f5f5'}
    >
      <div className="space-y-6 p-4">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className={`${index % 2 === 0 ? 'ml-auto w-4/5' : 'mr-auto w-4/5'}`}>
            <div className="mb-1">
              <Skeleton width={80} height={16} />
            </div>
            {index % 2 === 0 ? (
              // User-like message skeleton
              <Skeleton height={40} />
            ) : (
              // AI-like message skeleton (multiple lines)
              <div className="space-y-2">
                <Skeleton count={3} height={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

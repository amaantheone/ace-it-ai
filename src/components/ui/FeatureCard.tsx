import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: typeof LucideIcon;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  className?: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradientFrom, 
  gradientTo, 
  textColor,
  className = "",
  isPrimary = false,
  onClick
}: FeatureCardProps) {
  const cardClasses = isPrimary 
    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-md border border-white/15 hover:border-white/25 h-full relative`
    : `bg-gradient-to-br ${gradientFrom} ${gradientTo} p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] backdrop-blur-md border border-white/10 hover:border-white/15 h-full`;

  const iconContainerClasses = isPrimary
    ? "w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20"
    : "w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20";

  const iconClasses = isPrimary ? "w-6 h-6 text-white" : "w-5 h-5 text-white";
  const titleClasses = isPrimary ? "text-xl sm:text-2xl font-bold text-white mb-2" : "text-lg font-semibold text-white mb-2";
  const descriptionClasses = isPrimary ? `${textColor}` : `${textColor} text-sm`;
  const spacingClasses = isPrimary ? "space-x-6" : "space-x-3";

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick} tabIndex={0} role="button" onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}>
      <div className={cardClasses}>
        <div className={`flex items-start ${spacingClasses}`}>
          <div className={iconContainerClasses}>
            <Icon className={iconClasses} />
          </div>
          <div>
            <h3 className={titleClasses}>{title}</h3>
            <p className={descriptionClasses}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
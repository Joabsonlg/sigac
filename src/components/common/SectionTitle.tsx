
import React from 'react';
import { cn } from '@/lib/utils';

type SectionTitleProps = {
  title: string;
  action?: React.ReactNode;
  className?: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title, action, className }) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <h2 className="text-lg font-medium text-gray-800">{title}</h2>
      {action}
    </div>
  );
};

export default SectionTitle;

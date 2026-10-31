import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface Props {
  type?: 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const DisclaimerBanner: React.FC<Props> = ({
  type = 'info',
  title,
  message,
  className = '',
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      className={`rounded-xl p-4 border text-xs sm:text-sm flex items-start gap-3 transition-all ${
        isWarning
          ? 'bg-amber-50/80 border-amber-200/90 text-amber-900'
          : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
      } ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        {isWarning ? (
          <ShieldAlert className="w-5 h-5 text-amber-600" />
        ) : (
          <Info className="w-5 h-5 text-emerald-600" />
        )}
      </div>
      <div className="space-y-0.5">
        {title && <p className="font-semibold text-xs uppercase tracking-wider">{title}</p>}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
};

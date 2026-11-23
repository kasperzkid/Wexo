import React from 'react';

interface WexoLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WexoIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Bold geometric W for Wexo */}
    <path
      d="M5 8.5L10.5 24.5L16 13.5L21.5 24.5L27 8.5"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Accent escrow knot dot */}
    <circle cx="16" cy="6" r="2" fill="currentColor" />
  </svg>
);

export const WexoLogo: React.FC<WexoLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const boxSizes = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-8 w-8 rounded-lg',
    lg: 'h-10 w-10 rounded-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-[19px]',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex ${boxSizes[size]} items-center justify-center bg-lime border-2 border-ink shadow-brutal-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-brutal text-ink shrink-0`}
      >
        <WexoIcon className={iconSizes[size]} />
      </span>
      {!iconOnly && (
        <span className={`${textSizes[size]} font-black leading-none tracking-tight text-ink`}>
          Wexo<span className="text-lime-dark font-black">.</span>
        </span>
      )}
    </div>
  );
};

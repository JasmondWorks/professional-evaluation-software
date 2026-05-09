import React, { useState } from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function LoadingButton({ children, className = '', onClick, disabled, loading, ...rest }: Props) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading ?? internalLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    try {
      const result = (onClick as any)(e);
      if (result && typeof result.then === 'function') {
        setInternalLoading(true);
        result.finally(() => setInternalLoading(false));
      }
    } catch (err) {
      setInternalLoading(false);
      throw err;
    }
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${className} ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

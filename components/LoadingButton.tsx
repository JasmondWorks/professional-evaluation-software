import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
};

export default function LoadingButton({
  children,
  loading = false,
  className = "",
  disabled,
  ...props
}: Props) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={`${className} relative inline-flex items-center justify-center`}
    >
      <span style={{ opacity: loading ? 0 : 1, transition: "opacity .15s" }} aria-hidden={loading}>
        {children}
      </span>

      {loading && (
        <svg
          className="absolute w-5 h-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
    </button>
  );
}
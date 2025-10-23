import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth = false, className = '', ...props }, ref) => {
    const baseStyles = 'px-4 py-2 border rounded-lg outline-none transition';
    const errorStyles = error
      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = 'disabled:bg-gray-100 disabled:cursor-not-allowed';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${errorStyles}
            ${widthStyles}
            ${disabledStyles}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

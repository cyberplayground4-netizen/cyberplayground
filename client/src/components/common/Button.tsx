import React from 'react';
import { cn } from '../../utils/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'cyber-button',
          `variant-${variant}`,
          `size-${size}`,
          fullWidth && 'full-width',
          isLoading && 'loading',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <span className="loader"></span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

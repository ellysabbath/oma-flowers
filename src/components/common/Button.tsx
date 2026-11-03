// src/components/common/Button.tsx
import React from 'react';

type Variant = 'primary' | 'secondary';

interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'children'
  > {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled,
  ...rest
}) => {
  const baseClasses = variant === 'primary' ? 'btn-grey' : 'btn-success';

  return (
    <button
      type={type}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
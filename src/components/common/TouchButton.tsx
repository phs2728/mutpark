'use client';

import React, { useRef, useState, useCallback } from 'react';
import { createRippleEffect, triggerHapticFeedback } from '@/utils/touch/gestures';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
  haptic?: boolean;
  touchExpansion?: number;
  className?: string;
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  ripple = true,
  haptic = true,
  touchExpansion = 12,
  className = '',
  onClick,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  disabled,
  ...props
}: TouchButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [touchId, setTouchId] = useState<number | null>(null);

  const baseClasses = `
    relative overflow-hidden font-medium transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 select-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isPressed ? 'scale-95' : 'scale-100'}
  `;

  const variantClasses = {
    primary: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-red-500 active:bg-red-800
      ${isPressed ? 'bg-red-800' : ''}
    `,
    secondary: `
      bg-gray-600 hover:bg-gray-700 text-white
      focus:ring-gray-500 active:bg-gray-800
      ${isPressed ? 'bg-gray-800' : ''}
    `,
    outline: `
      border-2 border-red-600 text-red-600 hover:bg-red-50
      focus:ring-red-500 active:bg-red-100
      ${isPressed ? 'bg-red-100 border-red-700' : ''}
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100
      focus:ring-gray-500 active:bg-gray-200
      ${isPressed ? 'bg-gray-200' : ''}
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  // Touch expansion styles
  const touchExpansionStyle = {
    '--touch-expansion': `${touchExpansion}px`,
  } as React.CSSProperties;

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const touch = e.touches[0];
    if (touch) {
      setTouchId(touch.identifier);
      setIsPressed(true);

      if (haptic) {
        triggerHapticFeedback(50);
      }

      if (ripple && buttonRef.current) {
        createRippleEffect(buttonRef.current, e);
      }
    }

    onTouchStart?.(e);
  }, [disabled, haptic, ripple, onTouchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
    if (touch && buttonRef.current) {
      setIsPressed(false);
      setTouchId(null);

      // Check if touch ended within button bounds
      const rect = buttonRef.current.getBoundingClientRect();
      const isWithinBounds =
        touch.clientX >= rect.left - touchExpansion &&
        touch.clientX <= rect.right + touchExpansion &&
        touch.clientY >= rect.top - touchExpansion &&
        touch.clientY <= rect.bottom + touchExpansion;

      if (isWithinBounds && onClick) {
        onClick(e as any);
      }
    }

    onTouchEnd?.(e);
  }, [disabled, touchId, touchExpansion, onClick, onTouchEnd]);

  const handleTouchCancel = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    setTouchId(null);
    onTouchCancel?.(e);
  }, [onTouchCancel]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    setIsPressed(true);

    if (ripple && buttonRef.current) {
      createRippleEffect(buttonRef.current, e);
    }
  }, [disabled, ripple]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <>
      <style jsx>{`
        .touch-button::before {
          content: '';
          position: absolute;
          top: calc(-1 * var(--touch-expansion));
          left: calc(-1 * var(--touch-expansion));
          right: calc(-1 * var(--touch-expansion));
          bottom: calc(-1 * var(--touch-expansion));
          z-index: -1;
        }
      `}</style>
      <button
        ref={buttonRef}
        className={`touch-button ${combinedClassName}`}
        style={touchExpansionStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </>
  );
}

// Touch-friendly icon button
interface TouchIconButtonProps extends Omit<TouchButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}

export function TouchIconButton({
  icon,
  label,
  showLabel = false,
  size = 'md',
  ...props
}: TouchIconButtonProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <TouchButton
      size={size}
      className={`${showLabel ? 'flex items-center gap-2' : 'p-2 aspect-square flex items-center justify-center'}`}
      aria-label={label}
      {...props}
    >
      <span className={iconSizes[size]}>{icon}</span>
      {showLabel && <span>{label}</span>}
    </TouchButton>
  );
}

// Touch-friendly floating action button
interface TouchFABProps extends Omit<TouchButtonProps, 'variant' | 'size'> {
  icon: React.ReactNode;
  label: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function TouchFAB({
  icon,
  label,
  position = 'bottom-right',
  className = '',
  ...props
}: TouchFABProps) {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <TouchButton
      variant="primary"
      className={`
        ${positionClasses[position]}
        w-14 h-14 rounded-full shadow-lg shadow-red-500/25
        flex items-center justify-center z-50
        hover:shadow-xl hover:shadow-red-500/30
        ${className}
      `}
      aria-label={label}
      touchExpansion={16}
      {...props}
    >
      <span className="w-6 h-6">{icon}</span>
    </TouchButton>
  );
}
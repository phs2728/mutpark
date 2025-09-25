'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TouchButton } from './TouchButton';
import { triggerHapticFeedback } from '@/utils/touch/gestures';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MobileNavigationProps {
  items: NavItem[];
  className?: string;
}

export function MobileNavigation({ items, className = '' }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show navigation based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      if (scrollDirection === 'down' && currentScrollY > 100) {
        setIsVisible(false);
      } else if (scrollDirection === 'up') {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = () => {
    triggerHapticFeedback(25);
  };

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-white border-t border-gray-200
      transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      ${className}
    `}>
      <div className="safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center"
                onClick={handleNavClick}
              >
                <TouchButton
                  variant="ghost"
                  className={`
                    flex flex-col items-center justify-center
                    min-h-[60px] w-full max-w-[80px] mx-auto
                    rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  haptic={false}
                  ripple={false}
                >
                  <div className="relative">
                    <span className={`
                      block w-6 h-6 mb-1
                      ${isActive ? 'scale-110' : 'scale-100'}
                      transition-transform duration-200
                    `}>
                      {item.icon}
                    </span>

                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className="
                        absolute -top-2 -right-2
                        bg-red-500 text-white text-xs
                        min-w-[18px] h-[18px]
                        flex items-center justify-center
                        rounded-full border-2 border-white
                        font-bold
                      ">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>

                  <span className={`
                    text-xs font-medium
                    ${isActive ? 'text-red-600' : 'text-gray-600'}
                  `}>
                    {item.label}
                  </span>
                </TouchButton>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Mobile tab navigation component
interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MobileTabNavigationProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function MobileTabNavigation({
  items,
  activeTab,
  onTabChange,
  variant = 'default',
  className = '',
}: MobileTabNavigationProps) {
  const handleTabClick = (value: string, disabled?: boolean) => {
    if (disabled) return;

    triggerHapticFeedback(25);
    onTabChange(value);
  };

  const variantStyles = {
    default: {
      container: 'bg-gray-100 rounded-lg p-1',
      tab: 'flex-1 py-2 px-3 rounded-md transition-all duration-200',
      active: 'bg-white shadow-sm text-gray-900',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'bg-transparent',
      tab: 'flex-1 py-2 px-3 rounded-full transition-all duration-200',
      active: 'bg-red-600 text-white shadow-lg',
      inactive: 'text-gray-600 hover:bg-gray-100',
    },
    underline: {
      container: 'border-b border-gray-200',
      tab: 'flex-1 py-3 px-3 border-b-2 transition-all duration-200',
      active: 'border-red-600 text-red-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`
      flex items-center w-full
      ${styles.container}
      ${className}
    `}>
      {items.map((item) => {
        const isActive = activeTab === item.value;

        return (
          <TouchButton
            key={item.value}
            variant="ghost"
            className={`
              ${styles.tab}
              ${isActive ? styles.active : styles.inactive}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => handleTabClick(item.value, item.disabled)}
            disabled={item.disabled}
            haptic={false}
          >
            <div className="flex items-center justify-center gap-2">
              {item.icon && (
                <span className="w-4 h-4">{item.icon}</span>
              )}
              <span className="font-medium text-sm">{item.label}</span>
            </div>
          </TouchButton>
        );
      })}
    </div>
  );
}

// Mobile drawer navigation
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  overlay?: boolean;
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  overlay = true,
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const positionStyles = {
    left: {
      container: 'left-0 top-0 bottom-0',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    },
    right: {
      container: 'right-0 top-0 bottom-0',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    },
    bottom: {
      container: 'left-0 right-0 bottom-0',
      transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    },
  };

  const styles = positionStyles[position];

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          className={`
            fixed inset-0 bg-black bg-opacity-50 z-40
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed z-50 bg-white
          transition-transform duration-300 ease-out
          ${styles.container}
          ${position === 'bottom' ? 'rounded-t-xl' : ''}
        `}
        style={{ transform: styles.transform }}
      >
        {/* Drag handle for bottom drawer */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {children}
      </div>
    </>
  );
}
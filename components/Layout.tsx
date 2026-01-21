import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 dark:text-gray-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
};
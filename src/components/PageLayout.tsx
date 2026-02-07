import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  centerContent?: boolean; // Option to center content within the block
}

export function PageLayout({ children, centerContent = false }: PageLayoutProps) {
  // Use pt-20 to push content below the fixed navbar.
  // The outer div provides the full-screen grey background.
  // The inner div creates the centered white content block.
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 pt-20">
      <div className={`p-8 bg-white rounded-lg shadow-md max-w-7xl mx-auto w-full ${centerContent ? 'flex flex-col items-center' : ''}`}>
        {children}
      </div>
    </div>
  );
}

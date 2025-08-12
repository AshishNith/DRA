import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar: overlays on mobile, static on desktop */}
      <div className="fixed lg:static left-0 top-0 h-full z-40 w-64">
        <Sidebar />
      </div>
      {/* Main content: margin on desktop, full width on mobile */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
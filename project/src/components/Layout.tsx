import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="fixed left-0 top-0 h-full z-40">  
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-teal-700">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
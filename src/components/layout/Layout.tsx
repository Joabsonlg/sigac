
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

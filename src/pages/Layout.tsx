interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  // ... existing code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700">
      {/* Premium mobil header */}
      {showSidebar && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40 transition-all duration-500">
          // ... existing header code ...
        </div>
      )}

      <div className="flex h-screen">
        {/* Premium overlay */}
        {showSidebar && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 lg:hidden 
            transition-all duration-500 ease-out"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Premium sidebar */}
        {showSidebar && (
          <aside
            ref={sidebarRef}
            className={`
              fixed lg:static
              z-[60]
              will-change-transform
              transition-[width,transform] duration-200 ease-out
              bg-white/80 dark:bg-gray-800/80
              backdrop-blur-xl
              border-r border-gray-200/50 dark:border-gray-700/50
              h-full
              shadow-[0_0_30px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_-15px_rgba(0,0,0,0.5)]
              ${
                isSidebarOpen
                  ? 'translate-x-0 w-[280px] lg:w-64'
                  : '-translate-x-full w-[280px] lg:w-20 lg:translate-x-0'
              }
            `}
          >
            // ... existing sidebar code ...
          </aside>
        )}

        <main className={`flex-1 overflow-auto ${showSidebar ? 'pt-20 lg:pt-8 px-4 lg:px-8' : ''} transition-all duration-500`}>
          <div className={`${showSidebar ? 'max-w-7xl mx-auto' : ''}`}>{children}</div>
        </main>
      </div>
    </div>
  );
} 
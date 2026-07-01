'use client';

import { useState, type ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { useParams } from 'next/navigation';
import { useDocIndex } from '@/src/hooks/useDocs';
import DocsSidebar from '@/src/components/docs/DocsSidebar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function DocsLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ fileName: string }>();
  const { data: index, isLoading, isError } = useDocIndex(params.fileName);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`${inter.className} min-h-screen bg-stone-50 text-stone-900`}>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 md:hidden">
        <span className="truncate text-sm font-semibold">{index?.name ?? 'Docs'}</span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="rounded-md p-2 text-stone-500 hover:bg-stone-100"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-72 shrink-0 border-r border-stone-200 bg-white pt-14 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:pt-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto px-4 py-6">
            <DocsSidebar
              index={index}
              isLoading={isLoading}
              isError={isError}
              fileName={params.fileName}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-stone-900/30 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <main className="min-h-screen flex-1 pt-14 md:pt-0">
          <div className="mx-auto max-w-3xl px-6 py-10 md:px-12 md:py-16">{children}</div>
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
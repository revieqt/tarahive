'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocIndex } from '@/src/services/docsService';

interface DocsSidebarProps {
  index?: DocIndex;
  isLoading: boolean;
  isError: boolean;
  fileName: string;
  onNavigate?: () => void;
}

export default function DocsSidebar({
  index,
  isLoading,
  isError,
  fileName,
  onNavigate,
}: DocsSidebarProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-stone-100" />
        ))}
      </div>
    );
  }

  if (isError || !index) {
    return <p className="text-sm text-stone-400">Couldn&apos;t load navigation.</p>;
  }

  return (
    <nav aria-label="Docs sections">
      <p className="mb-4 truncate text-sm font-semibold text-stone-900">{index.name}</p>

      <div className="space-y-6">
        {index.groups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {group.name}
            </p>
            <ul className="space-y-0.5">
              {group.sections.map((section) => {
                const href = `/docs/${fileName}/${section.id}`;
                const active = pathname === href;
                return (
                  <li key={section.id}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? 'bg-indigo-50 font-medium text-indigo-700'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      {section.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
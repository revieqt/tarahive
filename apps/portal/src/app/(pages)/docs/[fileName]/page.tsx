'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocIndex } from '@/src/hooks/useDocs';

/**
 * Visiting /docs/[fileName] with no section has nothing to render on its
 * own — it exists only to redirect to the first available section, once
 * the index has loaded.
 */
export default function DocIndexPage() {
  const params = useParams<{ fileName: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useDocIndex(params.fileName);

  useEffect(() => {
    if (!data) return;

    const firstSection = data.groups.find((group) => group.sections.length > 0)?.sections[0];

    if (firstSection) {
      router.replace(`/docs/${data.id}/${firstSection.id}`);
    }
  }, [data, router]);

  if (isError) {
    return (
      <div className="text-sm text-stone-600">
        <p className="mb-1 font-medium text-stone-900">Couldn&apos;t load this doc.</p>
        <p>Check that &quot;{params.fileName}&quot; exists and try again.</p>
      </div>
    );
  }

  // Loading, or briefly shown while the redirect above is in flight.
  if (isLoading) {
    return <p className="text-sm text-stone-400">Loading...</p>;
  }

  return null;
}
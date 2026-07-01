'use client';

import { useParams } from 'next/navigation';
import { useDocSection } from '@/src/hooks/useDocs';
import DocsBlocks from '@/src/components/docs/DocsBlocks';

export default function DocSectionPage() {
  const params = useParams<{ fileName: string; section: string }>();
  const { data, isLoading, isError } = useDocSection(params.fileName, params.section);

  if (isLoading) {
    return <p className="text-sm text-stone-400">Loading...</p>;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-stone-600">
        <p className="mb-1 font-medium text-stone-900">Couldn&apos;t load this section.</p>
        <p>
          &quot;{params.section}&quot; may not exist under &quot;{params.fileName}&quot;.
        </p>
      </div>
    );
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{data.title}</h1>
        {data.subtitle ? <p className="mt-2 text-[15px] text-stone-500">{data.subtitle}</p> : null}
      </header>

      <DocsBlocks blocks={data.blocks} />
    </article>
  );
}
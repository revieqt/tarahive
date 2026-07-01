import type { DocBlock } from '@/src/services/docsService';

export default function DocsBlocks({ blocks }: { blocks: DocBlock[] }) {
  return <div className="space-y-5">{blocks.map((block, i) => renderBlock(block, i))}</div>;
}

function renderBlock(block: DocBlock, key: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={key} className="pt-4 text-xl font-semibold tracking-tight text-stone-900">
          {String(block.text)}
        </h2>
      );

    case 'paragraph':
      return (
        <p key={key} className="text-[15px] leading-7 text-stone-700">
          {String(block.text)}
        </p>
      );

    case 'list':
      return (
        <ul key={key} className="list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-stone-700">
          {(block.items as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'note':
      return (
        <div
          key={key}
          className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600"
        >
          {String(block.text)}
        </div>
      );

    case 'divider':
      return <hr key={key} className="border-t border-stone-200" />;

    case 'image':
      return (
        <figure key={key} className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(block.src)}
            alt={String(block.caption ?? '')}
            className="w-full rounded-lg border border-stone-200"
          />
          {block.caption ? (
            <figcaption className="text-center text-xs text-stone-400">
              {String(block.caption)}
            </figcaption>
          ) : null}
        </figure>
      );

    default:
      return null;
  }
}
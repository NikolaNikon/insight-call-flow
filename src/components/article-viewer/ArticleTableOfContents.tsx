
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ArticleTableOfContentsProps {
  content: string;
}

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export const ArticleTableOfContents = ({ content }: ArticleTableOfContentsProps) => {
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);

  useEffect(() => {
    const headings = content.match(/^(#{1,6})\s+(.+)$/gm) || [];
    const toc = headings.map((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s+/, '');
      const id = `heading-${index}`;
      return { id, text, level };
    });
    setTableOfContents(toc);
  }, [content]);

  const scrollToHeading = (headingId: string) => {
    const element = document.querySelector(`.prose #${headingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tableOfContents.length === 0) {
    return null;
  }

  return (
    <div className="w-64 border-r bg-gray-50 p-4 hidden md:block">
      <h4 className="font-semibold text-sm text-gray-700 mb-3">Содержание</h4>
      <ScrollArea className="h-[calc(90vh-120px)]">
        <div className="space-y-1">
          {tableOfContents.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className="block w-full text-left text-sm hover:bg-gray-200 p-2 rounded"
              style={{ marginLeft: `${(item.level - 1) * 16}px` }}
            >
              {item.text}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

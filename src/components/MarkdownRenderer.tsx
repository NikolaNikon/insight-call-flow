
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableAnchors?: boolean;
}

export const MarkdownRenderer = ({ 
  content, 
  className = '', 
  enableAnchors = false 
}: MarkdownRendererProps) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Простой парсер Markdown для основных элементов
    const parseMarkdown = (text: string) => {
      let headingIndex = 0;
      
      return text
        // Заголовки с якорями
        .replace(/^### (.*$)/gm, (match, title) => {
          const anchor = enableAnchors ? `id="heading-${headingIndex++}"` : '';
          return `<h3 ${anchor} class="text-lg font-semibold mt-6 mb-3 scroll-mt-4">${title}</h3>`;
        })
        .replace(/^## (.*$)/gm, (match, title) => {
          const anchor = enableAnchors ? `id="heading-${headingIndex++}"` : '';
          return `<h2 ${anchor} class="text-xl font-semibold mt-8 mb-4 scroll-mt-4">${title}</h2>`;
        })
        .replace(/^# (.*$)/gm, (match, title) => {
          const anchor = enableAnchors ? `id="heading-${headingIndex++}"` : '';
          return `<h1 ${anchor} class="text-2xl font-bold mt-8 mb-6 scroll-mt-4">${title}</h1>`;
        })
        
        // Жирный текст
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        
        // Курсив
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        
        // Код
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
        
        // Блоки кода
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code class="text-sm">$2</code></pre>')
        
        // Ссылки
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        
        // Списки
        .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1">$1. $2</li>')
        
        // Блокноты
        .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
        
        // Горизонтальная линия
        .replace(/^---$/gm, '<hr class="my-6 border-gray-300">')
        
        // Параграфы
        .split('\n\n')
        .map(paragraph => {
          if (paragraph.includes('<h') || 
              paragraph.includes('<li') || 
              paragraph.includes('<pre') ||
              paragraph.includes('<blockquote') ||
              paragraph.includes('<hr')) {
            return paragraph;
          }
          return paragraph.trim() ? `<p class="mb-4 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>` : '';
        })
        .join('\n');
    };

    const parsed = parseMarkdown(content);
    const sanitized = DOMPurify.sanitize(parsed);
    setHtmlContent(sanitized);
  }, [content, enableAnchors]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

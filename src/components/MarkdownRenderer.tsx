
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Простой парсер Markdown для основных элементов
    const parseMarkdown = (text: string) => {
      return text
        // Заголовки
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
        
        // Жирный текст
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        
        // Курсив
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        
        // Код
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
        
        // Ссылки
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
        
        // Списки
        .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
        
        // Параграфы
        .split('\n\n')
        .map(paragraph => {
          if (paragraph.includes('<h') || paragraph.includes('<li')) {
            return paragraph;
          }
          return paragraph.trim() ? `<p class="mb-4">${paragraph.replace(/\n/g, '<br>')}</p>` : '';
        })
        .join('\n');
    };

    const parsed = parseMarkdown(content);
    const sanitized = DOMPurify.sanitize(parsed);
    setHtmlContent(sanitized);
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

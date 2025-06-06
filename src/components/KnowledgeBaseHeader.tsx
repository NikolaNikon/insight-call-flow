
import React from 'react';
import { BookOpen } from 'lucide-react';

export const KnowledgeBaseHeader = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-graphite">База знаний</h1>
      </div>
      <p className="text-gray-600">
        Документация системы CallControl. Здесь вы найдете руководства, инструкции и описания функций.
      </p>
    </div>
  );
};

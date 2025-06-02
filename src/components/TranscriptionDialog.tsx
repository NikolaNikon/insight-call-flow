
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transcription: string;
  summary: string;
}

export const TranscriptionDialog = ({ isOpen, onClose, transcription, summary }: TranscriptionDialogProps) => {
  const [copyFormat, setCopyFormat] = useState<'text' | 'json' | 'markdown'>('text');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatContent = () => {
    switch (copyFormat) {
      case 'json':
        return JSON.stringify({
          transcription: transcription || 'Транскрипция недоступна',
          summary: summary || 'Краткое описание недоступно'
        }, null, 2);
      
      case 'markdown':
        return `# Транскрипция звонка

## Краткое описание
${summary || 'Краткое описание недоступно'}

## Полная транскрипция
${transcription || 'Транскрипция недоступна'}`;
      
      case 'text':
      default:
        return `Краткое описание:\n${summary || 'Краткое описание недоступно'}\n\nПолная транскрипция:\n${transcription || 'Транскрипция недоступна'}`;
    }
  };

  const handleCopy = async () => {
    try {
      const content = formatContent();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Скопировано!",
        description: `Текст скопирован в формате ${copyFormat.toUpperCase()}`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать текст в буфер обмена",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Транскрипция звонка</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={copyFormat} onValueChange={(value: 'text' | 'json' | 'markdown') => setCopyFormat(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Обычный текст</SelectItem>
                <SelectItem value="json">JSON формат</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Скопировано!' : 'Скопировать'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Краткое описание</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  {summary || 'Краткое описание недоступно'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Полная транскрипция</h3>
              <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {transcription || 'Транскрипция недоступна'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

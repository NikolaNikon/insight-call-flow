
import React, { useState, useRef } from 'react';
import { Upload, X, FileAudio, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  callId?: string;
  error?: string;
}

export const AudioUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Загружаем менеджеров и клиентов
  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('managers').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      return data;
    }
  });

  const validateFile = (file: File): string | null => {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/mpeg'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      return 'Неподдерживаемый формат файла. Поддерживаются: MP3, WAV, M4A, WEBM, OGG';
    }

    if (file.size > maxSize) {
      return 'Файл слишком большой. Максимальный размер: 100MB';
    }

    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelection(droppedFiles);
  };

  const handleFileSelection = (selectedFiles: File[]) => {
    const newFiles: UploadFile[] = [];

    selectedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Ошибка файла",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        return;
      }

      newFiles.push({
        file,
        id: Date.now() + Math.random().toString(),
        progress: 0,
        status: 'pending'
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadFileData: UploadFile) => {
    if (!selectedManager || !selectedCustomer) {
      toast({
        title: "Ошибка",
        description: "Выберите менеджера и клиента",
        variant: "destructive"
      });
      return;
    }

    try {
      // Обновляем статус
      setFiles(prev => prev.map(f => 
        f.id === uploadFileData.id ? { ...f, status: 'uploading' } : f
      ));

      const formData = new FormData();
      formData.append('audio', uploadFileData.file);
      formData.append('managerId', selectedManager);
      formData.append('customerId', selectedCustomer);

      // Вызываем edge function для загрузки
      const { data, error } = await supabase.functions.invoke('upload-audio', {
        body: formData
      });

      if (error) throw error;

      // Обновляем статус на обработку
      setFiles(prev => prev.map(f => 
        f.id === uploadFileData.id 
          ? { ...f, status: 'processing', callId: data.callId, progress: 100 }
          : f
      ));

      toast({
        title: "Файл загружен",
        description: "Началась обработка аудиозаписи",
      });

      // Начинаем мониторинг обработки
      startProcessingMonitor(uploadFileData.id, data.callId);

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadFileData.id 
          ? { ...f, status: 'error', error: 'Ошибка загрузки файла' }
          : f
      ));
      
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файл",
        variant: "destructive"
      });
    }
  };

  const startProcessingMonitor = (fileId: string, callId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('processing_status, processing_step, error_message')
          .eq('id', callId)
          .single();

        if (error) throw error;

        setFiles(prev => prev.map(f => {
          if (f.id === fileId) {
            if (data.processing_status === 'completed') {
              clearInterval(interval);
              toast({
                title: "Обработка завершена",
                description: "Аудиозапись успешно обработана",
              });
              return { ...f, status: 'completed' };
            } else if (data.processing_status === 'failed') {
              clearInterval(interval);
              return { 
                ...f, 
                status: 'error', 
                error: data.error_message || 'Ошибка обработки'
              };
            }
          }
          return f;
        }));

      } catch (error) {
        console.error('Monitoring error:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'uploading': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'uploading': return 'Загрузка';
      case 'processing': return 'Обработка';
      case 'completed': return 'Готово';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-blue-600" />
          Загрузка аудиозаписей звонков
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Выбор менеджера и клиента */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Менеджер</label>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите менеджера" />
              </SelectTrigger>
              <SelectContent>
                {managers.map(manager => (
                  <SelectItem key={manager.id} value={manager.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {manager.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Клиент</label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {customer.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drag & Drop зона */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Перетащите аудиофайлы сюда
          </p>
          <p className="text-sm text-gray-500 mb-4">
            или нажмите для выбора файлов
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedManager || !selectedCustomer}
          >
            Выбрать файлы
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelection(Array.from(e.target.files || []))}
          />
          <p className="text-xs text-gray-400 mt-2">
            Поддерживаемые форматы: MP3, WAV, M4A, WEBM, OGG (до 100MB)
          </p>
        </div>

        {/* Список файлов */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Файлы для загрузки</h3>
            {files.map(uploadFileData => (
              <div key={uploadFileData.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{uploadFileData.file.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-white ${getStatusColor(uploadFileData.status)}`}
                    >
                      {getStatusText(uploadFileData.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadFileData.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => uploadFile(uploadFileData)}
                        disabled={!selectedManager || !selectedCustomer}
                      >
                        Загрузить
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFileData.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {uploadFileData.status === 'uploading' && (
                  <Progress value={uploadFileData.progress} className="mb-2" />
                )}
                
                {uploadFileData.error && (
                  <p className="text-sm text-red-600">{uploadFileData.error}</p>
                )}
                
                <div className="text-xs text-gray-500">
                  Размер: {(uploadFileData.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

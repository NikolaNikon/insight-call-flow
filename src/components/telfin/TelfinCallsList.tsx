
import React from 'react';
import { useTelfinCalls } from '@/hooks/useTelfinCalls';
import { Loader2, Inbox } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const TelfinCallsList = () => {
  const { data: calls, isLoading, error } = useTelfinCalls();

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Ошибка загрузки звонков: {error.message}</div>;
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 p-8 rounded-lg mt-4">
        <Inbox className="h-12 w-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold">Звонки не найдены</h3>
        <p className="text-sm">Синхронизируйте историю звонков на вкладке "Статус", чтобы они появились здесь.</p>
      </div>
    );
  }

  return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Синхронизированные звонки</CardTitle>
            <CardDescription>Список последних звонков, загруженных из Телфин.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Кто звонил</TableHead>
                        <TableHead>Куда звонили</TableHead>
                        <TableHead>Длительность</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Запись</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {calls.map((call) => (
                        <TableRow key={call.id}>
                        <TableCell className="text-xs">{call.start_time ? new Date(call.start_time).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{call.caller_number}</TableCell>
                        <TableCell>{call.called_number}</TableCell>
                        <TableCell>{call.duration} сек.</TableCell>
                        <TableCell><Badge variant="outline">{call.status}</Badge></TableCell>
                        <TableCell>{call.has_record ? 'Есть' : 'Нет'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
      </CardContent>
    </Card>
  );
};

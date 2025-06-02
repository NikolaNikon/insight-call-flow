
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { exportId, type } = await req.json();
    
    console.log(`Generating ${type} export for ID: ${exportId}`);

    // Получаем данные экспорта
    const { data: exportData, error: exportError } = await supabaseClient
      .from('exports')
      .select('*')
      .eq('id', exportId)
      .single();

    if (exportError) {
      throw new Error(`Export not found: ${exportError.message}`);
    }

    // Обновляем статус на processing
    await supabaseClient
      .from('exports')
      .update({ status: 'processing' })
      .eq('id', exportId);

    // Получаем данные звонков
    const { data: calls, error: callsError } = await supabaseClient
      .from('calls')
      .select(`
        id,
        date,
        transcription,
        summary,
        general_score,
        user_satisfaction_index,
        communication_skills,
        sales_technique,
        customers:customer_id (name, phone_number),
        managers:manager_id (name)
      `)
      .order('date', { ascending: false })
      .limit(100);

    if (callsError) {
      throw new Error(`Failed to fetch calls: ${callsError.message}`);
    }

    let fileContent = '';
    let fileName = '';
    let mimeType = '';

    // Генерируем контент в зависимости от типа
    switch (type) {
      case 'json':
        fileContent = JSON.stringify(calls, null, 2);
        fileName = `calls_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
        
      case 'excel':
        // Простой CSV для Excel
        const csvHeaders = ['ID', 'Дата', 'Клиент', 'Менеджер', 'Общий балл', 'Удовлетворенность', 'Краткое описание'];
        const csvRows = calls?.map(call => [
          call.id,
          new Date(call.date).toLocaleString('ru-RU'),
          call.customers?.name || 'Неизвестно',
          call.managers?.name || 'Неизвестно',
          call.general_score || 0,
          (call.user_satisfaction_index || 0) * 10,
          call.summary || ''
        ]) || [];
        
        fileContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        fileName = `calls_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
        
      case 'pdf':
        // Простой текстовый отчет для PDF
        fileContent = `Отчет по звонкам\nСгенерирован: ${new Date().toLocaleString('ru-RU')}\n\n`;
        calls?.forEach((call, index) => {
          fileContent += `${index + 1}. ${call.customers?.name || 'Неизвестный клиент'}\n`;
          fileContent += `   Дата: ${new Date(call.date).toLocaleString('ru-RU')}\n`;
          fileContent += `   Менеджер: ${call.managers?.name || 'Неизвестно'}\n`;
          fileContent += `   Балл: ${call.general_score || 0}/10\n`;
          fileContent += `   Описание: ${call.summary || 'Нет описания'}\n\n`;
        });
        fileName = `calls_export_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
        
      default:
        throw new Error('Unsupported export type');
    }

    // Создаем blob URL (в реальном проекте здесь была бы загрузка в Storage)
    const fileUrl = `data:${mimeType};base64,${btoa(unescape(encodeURIComponent(fileContent)))}`;

    // Обновляем экспорт как завершенный
    await supabaseClient
      .from('exports')
      .update({ 
        status: 'completed',
        file_url: fileUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportId);

    console.log(`Export ${exportId} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, fileUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Export generation error:', error);
    
    // Обновляем статус на failed в случае ошибки
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { exportId } = await req.json().catch(() => ({}));
    if (exportId) {
      await supabaseClient
        .from('exports')
        .update({ status: 'failed' })
        .eq('id', exportId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

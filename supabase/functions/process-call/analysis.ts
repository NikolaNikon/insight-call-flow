
import type { NexaraTranscriptionResponse, AnalysisResult } from './types.ts';

export function analyzeTranscription(transcription: NexaraTranscriptionResponse): AnalysisResult {
  const text = transcription.text.toLowerCase();
  
  // Анализ по сегментам диаризации
  let managerSegments = [];
  let customerSegments = [];
  
  if (transcription.segments) {
    // Разделяем сегменты по спикерам
    transcription.segments.forEach(segment => {
      if (segment.speaker === 'speaker_0') {
        managerSegments.push(segment);
      } else {
        customerSegments.push(segment);
      }
    });
  }
  
  // Анализ качества разговора на основе ключевых слов и фраз
  const positiveWords = ['спасибо', 'отлично', 'хорошо', 'понятно', 'согласен', 'да', 'подходит', 'интересно', 'удобно'];
  const negativeWords = ['нет', 'не подходит', 'дорого', 'не интересно', 'плохо', 'не понимаю', 'отказываюсь'];
  const salesWords = ['предложение', 'скидка', 'акция', 'условия', 'цена', 'стоимость', 'бронирование', 'услуга'];
  const qualityWords = ['здравствуйте', 'до свидания', 'пожалуйста', 'извините', 'понимаю', 'помогу'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  const salesCount = salesWords.filter(word => text.includes(word)).length;
  const qualityCount = qualityWords.filter(word => text.includes(word)).length;
  
  // Анализ длительности разговора менеджера vs клиента
  const managerTalkTime = managerSegments.reduce((total, seg) => total + (seg.end - seg.start), 0);
  const customerTalkTime = customerSegments.reduce((total, seg) => total + (seg.end - seg.start), 0);
  const talkRatio = customerTalkTime > 0 ? managerTalkTime / customerTalkTime : 1;
  
  // Расчет метрик (возвращаем целые числа)
  let general_score = 7; // Базовый балл
  general_score += Math.min(2, positiveCount * 0.5); // Позитивные слова добавляют балл
  general_score -= Math.min(2, negativeCount * 0.5); // Негативные слова убавляют балл
  general_score += Math.min(1, qualityCount * 0.3); // Вежливость добавляет балл
  general_score = Math.round(Math.min(10, Math.max(1, general_score)));
  
  // Удовлетворенность клиента (возвращаем целые числа)
  let satisfaction = 7;
  satisfaction += Math.min(2, positiveCount * 0.6);
  satisfaction -= Math.min(3, negativeCount * 0.8);
  satisfaction = Math.round(Math.min(10, Math.max(1, satisfaction)));
  
  // Коммуникативные навыки (возвращаем целые числа)
  let communication = 7;
  communication += Math.min(2, qualityCount * 0.4);
  communication += talkRatio > 2 ? -1 : (talkRatio < 0.5 ? 1 : 0); // Оптимальное соотношение речи
  communication = Math.round(Math.min(10, Math.max(1, communication)));
  
  // Техника продаж (возвращаем целые числа)
  let sales = 6;
  sales += Math.min(2, salesCount * 0.5);
  sales += transcription.segments && transcription.segments.length > 4 ? 1 : 0; // Структурированный разговор
  sales = Math.round(Math.min(10, Math.max(1, sales)));
  
  // Качество транскрипции (возвращаем целые числа)
  const transcription_score = transcription.text.length > 50 ? 10 : 7;
  
  // Генерация описания на основе диаризации
  let summary = 'Стандартный разговор с клиентом';
  if (transcription.segments && transcription.segments.length > 0) {
    const speakerCount = new Set(transcription.segments.map(s => s.speaker)).size;
    if (speakerCount >= 2) {
      summary = `Диалог между ${speakerCount} участниками`;
      if (positiveCount > negativeCount) {
        summary += ', клиент проявил интерес к предложению';
      } else if (negativeCount > positiveCount) {
        summary += ', клиент выразил возражения';
      } else {
        summary += ', нейтральное обсуждение услуг';
      }
    }
  }
  
  // Обратная связь и советы
  let feedback = 'Менеджер провел разговор профессионально';
  let advice = 'Продолжайте работать в том же ключе';
  
  if (general_score < 6) {
    feedback = 'Разговор требует улучшения качества коммуникации';
    advice = 'Рекомендуется больше слушать клиента, использовать вежливые обороты и четче презентовать услуги';
  } else if (general_score >= 8) {
    feedback = 'Отличная работа менеджера, высокое качество общения';
    advice = 'Поделитесь успешными техниками с коллегами';
  }
  
  if (talkRatio > 3) {
    advice += '. Старайтесь больше слушать клиента и меньше говорить самостоятельно';
  }
  
  return {
    summary,
    general_score,
    user_satisfaction_index: satisfaction,
    communication_skills: communication,
    sales_technique: sales,
    transcription_score,
    feedback,
    advice
  };
}

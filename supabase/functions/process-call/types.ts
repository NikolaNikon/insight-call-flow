
export interface NexaraTranscriptionResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
}

export interface AnalysisResult {
  summary: string;
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  feedback: string;
  advice: string;
}

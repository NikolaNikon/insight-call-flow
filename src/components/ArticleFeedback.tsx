
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useSubmitFeedback } from '@/hooks/useKnowledgeBase';

interface ArticleFeedbackProps {
  articleId: string;
}

export const ArticleFeedback = ({ articleId }: ArticleFeedbackProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showTextArea, setShowTextArea] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const handleFeedbackClick = (isHelpful: boolean) => {
    setSelectedFeedback(isHelpful);
    if (!isHelpful) {
      setShowTextArea(true);
    } else {
      submitFeedback.mutate({
        article_id: articleId,
        is_helpful: isHelpful,
      });
    }
  };

  const handleSubmitDetailed = () => {
    if (selectedFeedback !== null) {
      submitFeedback.mutate({
        article_id: articleId,
        is_helpful: selectedFeedback,
        feedback_text: feedbackText.trim() || undefined,
      });
      setShowTextArea(false);
      setFeedbackText('');
    }
  };

  if (selectedFeedback !== null && !showTextArea) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              Спасибо за ваш отзыв! Это поможет нам улучшить документацию.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Была ли эта статья полезной?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedFeedback === null && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleFeedbackClick(true)}
              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
            >
              <ThumbsUp className="h-4 w-4" />
              Да, полезна
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFeedbackClick(false)}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
            >
              <ThumbsDown className="h-4 w-4" />
              Нет, не полезна
            </Button>
          </div>
        )}

        {showTextArea && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Что можно улучшить в этой статье?
              </label>
              <Textarea
                placeholder="Расскажите, что не хватало или было непонятно..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitDetailed}
                disabled={submitFeedback.isPending}
                size="sm"
              >
                Отправить отзыв
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTextArea(false);
                  setSelectedFeedback(null);
                }}
                size="sm"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

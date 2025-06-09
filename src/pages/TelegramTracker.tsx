
import React from 'react';
import { TelegramFeatureTracker } from '@/components/TelegramFeatureTracker';

const TelegramTracker = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <TelegramFeatureTracker />
      </div>
    </div>
  );
};

export default TelegramTracker;

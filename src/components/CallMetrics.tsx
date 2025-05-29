
import { getScoreColor } from "@/utils/callUtils";

interface CallMetricsProps {
  userSatisfactionIndex: number;
  transcriptionScore: number;
  communicationSkills: number;
  salesTechnique: number;
}

export const CallMetrics = ({
  userSatisfactionIndex,
  transcriptionScore,
  communicationSkills,
  salesTechnique
}: CallMetricsProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 text-xs">
      <div className="text-center p-2 bg-gray-50 rounded">
        <div className="font-medium text-gray-900">{userSatisfactionIndex}%</div>
        <div className="text-gray-500">Удовлетворенность</div>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded">
        <div className={`font-medium ${getScoreColor(transcriptionScore)}`}>
          {transcriptionScore}
        </div>
        <div className="text-gray-500">Транскрипция</div>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded">
        <div className={`font-medium ${getScoreColor(communicationSkills)}`}>
          {communicationSkills}
        </div>
        <div className="text-gray-500">Коммуникация</div>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded">
        <div className={`font-medium ${getScoreColor(salesTechnique)}`}>
          {salesTechnique}
        </div>
        <div className="text-gray-500">Продажи</div>
      </div>
    </div>
  );
};

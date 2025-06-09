
import { AudioUploader } from "@/components/AudioUploader";
import { ProcessingMonitor } from "@/components/ProcessingMonitor";

const Upload = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Загрузка звонков
        </h1>
        <p className="text-gray-600">
          Загружайте аудиофайлы звонков для анализа и получения метрик качества
        </p>
      </div>

      <AudioUploader />
      <ProcessingMonitor />
    </div>
  );
};

export default Upload;

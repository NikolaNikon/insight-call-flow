
import { ExportManager } from "@/components/ExportManager";

const Export = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Экспорт данных
        </h1>
        <p className="text-gray-600">
          Экспортируйте отчеты и данные анализа в различных форматах
        </p>
      </div>

      <ExportManager />
    </div>
  );
};

export default Export;

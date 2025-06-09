
interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
}

export const AnalyticsHeader = ({ title, subtitle }: AnalyticsHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-600">
        {subtitle}
      </p>
    </div>
  );
};

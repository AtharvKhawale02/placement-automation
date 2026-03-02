/**
 * Professional Bar Chart Component
 * Pure CSS/SVG implementation - no external dependencies
 */
function BarChart({ data, title, color = "primary" }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = {
    primary: { bg: "bg-primary-500", light: "bg-primary-100", text: "text-primary-700" },
    accent: { bg: "bg-accent-500", light: "bg-accent-100", text: "text-accent-700" },
    green: { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" },
    blue: { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
    purple: { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
  };

  const colorScheme = colors[color] || colors.primary;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      {title && (
        <h3 className="text-lg font-bold text-secondary-900 mb-6">{title}</h3>
      )}
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-secondary-700">{item.label}</span>
                <span className={`font-bold ${colorScheme.text}`}>{item.value}</span>
              </div>
              <div className={`h-3 ${colorScheme.light} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${colorScheme.bg} rounded-full transition-all duration-700 ease-out`}
                  style={{ 
                    width: `${percentage}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BarChart;

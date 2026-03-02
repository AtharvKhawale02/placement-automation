/**
 * Professional Line Chart Component
 * Pure SVG implementation for trend visualization
 */
function LineChart({ data, title, color = "primary" }) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const colors = {
    primary: { stroke: "#3B82F6", fill: "#3B82F6", gradient: "rgba(59, 130, 246, 0.1)" },
    accent: { stroke: "#8B5CF6", fill: "#8B5CF6", gradient: "rgba(139, 92, 246, 0.1)" },
    green: { stroke: "#10B981", fill: "#10B981", gradient: "rgba(16, 185, 129, 0.1)" },
  };

  const colorScheme = colors[color] || colors.primary;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
    const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, label: item.label, value: item.value };
  });

  // Create path for line
  const linePath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Create path for area fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      {title && (
        <h3 className="text-lg font-bold text-secondary-900 mb-4">{title}</h3>
      )}
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * (1 - ratio);
          const value = Math.round(minValue + valueRange * ratio);
          return (
            <g key={index}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-secondary-500"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={colorScheme.gradient}
          className="animate-fade-in"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colorScheme.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index} className="cursor-pointer group">
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke={colorScheme.stroke}
              strokeWidth="3"
              className="transition-all group-hover:r-7"
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 100}ms both`
              }}
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <rect
                x={point.x - 40}
                y={point.y - 50}
                width="80"
                height="36"
                rx="6"
                fill="#1F2937"
                className="drop-shadow-lg"
              />
              <text
                x={point.x}
                y={point.y - 32}
                textAnchor="middle"
                className="text-xs font-bold fill-white"
              >
                {point.value}
              </text>
              <text
                x={point.x}
                y={point.y - 20}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {point.label}
              </text>
            </g>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-secondary-600 font-medium"
          >
            {point.label}
          </text>
        ))}
      </svg>

      <style jsx>{`
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-line {
          animation: draw-line 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default LineChart;

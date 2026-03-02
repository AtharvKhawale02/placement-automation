/**
 * Professional Donut/Pie Chart Component
 * Pure SVG implementation
 */
function PieChart({ data, title, size = 200 }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6; // Donut chart

  const colors = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#06B6D4", // cyan
    "#EC4899", // pink
  ];

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Calculate path for donut segment
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    currentAngle = endAngle;

    return {
      path: pathData,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      {title && (
        <h3 className="text-lg font-bold text-secondary-900 mb-4">{title}</h3>
      )}
      <div className="flex items-center gap-6">
        {/* SVG Chart */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-0">
            {segments.map((segment, index) => (
              <g key={index}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    animation: `fadeIn 0.5s ease-out ${index * 100}ms both`
                  }}
                >
                  <title>{`${segment.label}: ${segment.value} (${segment.percentage}%)`}</title>
                </path>
              </g>
            ))}
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-secondary-900">{total}</div>
            <div className="text-xs font-semibold text-secondary-600">Total</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                  {segment.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-secondary-900">{segment.value}</span>
                <span className="text-xs text-secondary-500 ml-1">({segment.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PieChart;

'use client';

export default function CarbonFootprintChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No carbon data available yet
      </div>
    );
  }

  const maxCarbon = Math.max(...data.map((d) => d.carbon));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900 truncate max-w-xs">
              {item.release}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-xs">
                {item.streams?.toLocaleString()} streams
              </span>
              <span className="font-semibold text-gray-900">
                {item.carbon.toFixed(2)} kg CO₂e
              </span>
            </div>
          </div>
          <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${(item.carbon / maxCarbon) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

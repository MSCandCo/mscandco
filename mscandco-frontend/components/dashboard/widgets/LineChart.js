/**
 * Line Chart Widget (Placeholder)
 * TODO: Implement with charting library (recharts, chart.js, etc.)
 */

export default function LineChart({ widget, config }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.name}</h3>
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded">
        <p className="text-gray-500 text-sm">Chart visualization (coming soon)</p>
      </div>
    </div>
  );
}

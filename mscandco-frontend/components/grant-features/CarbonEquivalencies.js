export default function CarbonEquivalencies({ carbonKg }) {
  const equivalencies = [
    {
      icon: '🌳',
      label: 'Trees needed',
      value: Math.ceil(carbonKg / 21),
      unit: 'trees for 1 year',
      description: 'to absorb this carbon',
    },
    {
      icon: '🚗',
      label: 'Miles driven',
      value: Math.round((carbonKg / 0.411) * 0.621371),
      unit: 'miles',
      description: 'in an average car',
    },
    {
      icon: '📱',
      label: 'Phone charges',
      value: Math.round(carbonKg / 0.000008),
      unit: 'charges',
      description: 'smartphone equivalent',
    },
    {
      icon: '🏠',
      label: 'Home energy',
      value: (carbonKg / 0.233).toFixed(1),
      unit: 'kWh',
      description: 'electricity equivalent',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Carbon Equivalencies</h2>
      <p className="text-sm text-gray-600 mb-6">
        Your {carbonKg.toFixed(2)} kg CO₂e is equivalent to:
      </p>

      <div className="grid grid-cols-2 gap-4">
        {equivalencies.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 text-center hover:border-green-300 transition"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">
              {item.unit}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-xs text-green-800">
          <strong>Note:</strong> Calculations based on DIMPACT 2024 methodology.
          1 mature tree absorbs ~21 kg CO₂e/year. Average car emits 0.411 kg
          CO₂e/mile.
        </p>
      </div>
    </div>
  );
}

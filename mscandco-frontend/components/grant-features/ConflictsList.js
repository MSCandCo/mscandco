export default function ConflictsList({ conflicts }) {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No conflicts detected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map((conflict, index) => (
        <div
          key={index}
          className="border border-red-200 rounded-lg p-4 bg-red-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {conflict.matched_work_title || 'Unknown Work'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                by {conflict.matched_artist || 'Unknown Artist'}
              </p>

              {conflict.conflict_type && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {conflict.conflict_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {conflict.similarity_score && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Similarity Score</span>
                    <span className="font-medium text-gray-900">
                      {conflict.similarity_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${conflict.similarity_score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {conflict.matched_sections && conflict.matched_sections.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Matched Sections:</p>
                  <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                    {conflict.matched_sections.map((section, idx) => (
                      <li key={idx}>{section}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="ml-4">
              {conflict.severity === 'high' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
                  High Risk
                </span>
              )}
              {conflict.severity === 'medium' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-600 text-white">
                  Medium Risk
                </span>
              )}
              {conflict.severity === 'low' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-600 text-white">
                  Low Risk
                </span>
              )}
            </div>
          </div>

          {conflict.recommendation && (
            <div className="mt-4 p-3 bg-white rounded border border-red-200">
              <p className="text-sm font-medium text-gray-900">
                Recommendation:
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {conflict.recommendation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

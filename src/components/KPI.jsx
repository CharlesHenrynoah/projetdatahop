// src/components/KPI.jsx
export default function KPI({ title, value, trend, status }) {
  let statusColor = 'bg-gray-100 text-gray-800'
  let trendIcon = ''
  if (status === 'good') {
    statusColor = 'bg-green-100 text-green-800'
    trendIcon = trend > 0 ? '↑' : '↓'
  } else if (status === 'warning') {
    statusColor = 'bg-yellow-100 text-yellow-800'
    trendIcon = trend > 0 ? '↑' : '↓'
  } else if (status === 'critical') {
    statusColor = 'bg-red-100 text-red-800'
    trendIcon = trend > 0 ? '↑' : '↓'
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900 mr-2">{value}</p>
        {trend !== undefined && (
          <span
            className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {trendIcon} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {status && (
        <div
          className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        >
          {status === 'good' && '✅ Normal'}
          {status === 'warning' && '⚠ Attention'}
          {status === 'critical' && '🚨 Critique'}
        </div>
      )}
    </div>
  )
}

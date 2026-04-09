export default function VehicleStatusIndicator({ status, className = '' }) {
  const statusConfig = {
    moving: {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      label: 'Moving',
      icon: '🚗'
    },
    idle: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      label: 'Idle',
      icon: '⏸️'
    },
    offline: {
      color: 'bg-gray-500',
      textColor: 'text-gray-400',
      label: 'Offline',
      icon: '📡'
    }
  }

  const config = statusConfig[status] || statusConfig.offline

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 border border-purple-500/20 w-fit ${className}`}>
      <span className="text-lg">{config.icon}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`}></div>
        <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
      </div>
    </div>
  )
}

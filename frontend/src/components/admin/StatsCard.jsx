export default function StatsCard({ title, value, icon: Icon, trend, bgGradient }) {
  return (
    <div className={`${bgGradient} rounded-xl p-6 border border-white/10 backdrop-blur-md hover:border-white/20 transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-white/10">
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatCard({ icon: Icon, label, value, change, positive, color, loading = false }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 hover:shadow-glow-purple transition group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition`}>
          {Icon && <Icon size={24} className={color} />}
        </div>
        {change && (
          <span className={`text-xs px-3 py-1 rounded-full ${positive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      {loading ? (
        <div className="h-8 bg-white/10 rounded animate-pulse"></div>
      ) : (
        <h2 className="text-3xl font-bold text-white">{value}</h2>
      )}
    </div>
  )
}

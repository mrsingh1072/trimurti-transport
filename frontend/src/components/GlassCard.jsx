export default function GlassCard({ children, className = '', glow = false }) {
  return (
    <div className={`
      glass-card rounded-2xl border border-purple-500/20 backdrop-blur-xl
      hover:border-purple-500/50 hover:shadow-lg
      ${glow ? 'hover:shadow-glow-purple' : ''}
      transition bg-gradient-to-br from-white/10 to-white/5
      ${className}
    `}>
      {children}
    </div>
  )
}

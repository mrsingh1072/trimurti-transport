export default function Card({ children, className = "", hover = true, glow = false }) {
  return (
    <div 
      className={`
        glass
        ${hover ? 'card-hover' : ''}
        ${glow ? 'glass-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

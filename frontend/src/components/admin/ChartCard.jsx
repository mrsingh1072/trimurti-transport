export default function ChartCard({ title, children, height = 'h-80' }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className={height}>
        {children}
      </div>
    </div>
  )
}

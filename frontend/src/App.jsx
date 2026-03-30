import { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar onNavigate={setCurrentPage} />
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'dashboard' && <DashboardPage />}
    </div>
  )
}

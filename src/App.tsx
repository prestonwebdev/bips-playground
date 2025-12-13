import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardV1Demo from './experiments/DashboardV1Demo'
import DashboardV2Demo from './experiments/DashboardV2Demo'
import DashboardV4Demo from './experiments/DashboardV4Demo'
import Design from './pages/Design'
import DevSelector from './components/DevSelector'

const STORAGE_KEY = 'bips-dashboard-version'

function DashboardSelector() {
  const [version, setVersion] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'v4'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, version)
  }, [version])

  const renderDashboard = () => {
    switch (version) {
      case 'v1':
        return <DashboardV1Demo />
      case 'v2':
        return <DashboardV2Demo />
      case 'v4':
      default:
        return <DashboardV4Demo />
    }
  }

  return (
    <>
      {renderDashboard()}
      <DevSelector currentVersion={version} onVersionChange={setVersion} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardSelector />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

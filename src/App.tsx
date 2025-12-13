import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardV1Demo from './experiments/DashboardV1Demo'
import DashboardV4Demo from './experiments/DashboardV4Demo'
import PrototypeV3 from './experiments/PrototypeV3'
import Design from './pages/Design'
import DevSelector from './components/DevSelector'

const STORAGE_KEY = 'bips-prototype-version'

/**
 * PrototypeSelector - Renders the appropriate prototype version
 *
 * Versions:
 * - V1: Original prototype (DashboardV1Demo)
 * - V2: Previous prototype with chat-focused overview, reports, transactions (DashboardV4Demo)
 * - V3: Current prototype (PrototypeV3)
 */
function PrototypeSelector() {
  const [version, setVersion] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'v3'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, version)
  }, [version])

  const renderPrototype = () => {
    switch (version) {
      case 'v1':
        return <DashboardV1Demo />
      case 'v2':
        return <DashboardV4Demo />
      case 'v3':
        return <PrototypeV3 />
      default:
        return <PrototypeV3 />
    }
  }

  return (
    <>
      {renderPrototype()}
      <DevSelector currentVersion={version} onVersionChange={setVersion} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrototypeSelector />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

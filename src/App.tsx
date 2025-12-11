import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardV1Demo from './experiments/DashboardV1Demo'
import DashboardV2Demo from './experiments/DashboardV2Demo'
import DashboardV4Demo from './experiments/DashboardV4Demo'
import ReportsDemo from './experiments/ReportsDemo'
import Design from './pages/Design'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardV2Demo />} />
        <Route path="/v1" element={<DashboardV1Demo />} />
        <Route path="/v2" element={<DashboardV2Demo />} />
        <Route path="/v4" element={<DashboardV4Demo />} />
        <Route path="/reports" element={<ReportsDemo />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

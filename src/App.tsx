import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatBarDemo from './experiments/ChatBarDemo'
import SidebarDemo from './experiments/SidebarDemo'
import FinancialCardsDemo from './experiments/FinancialCardsDemo'
import Design from './pages/Design'
import DashboardV2Demo from './experiments/DashboardV2Demo'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatBarDemo />} />
        <Route path="/dashboard" element={<SidebarDemo />} />
        <Route path="/dashboard-v2" element={<DashboardV2Demo />} />
        <Route path="/cards" element={<FinancialCardsDemo />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardV2Demo from './experiments/DashboardV2Demo'
import Design from './pages/Design'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardV2Demo />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

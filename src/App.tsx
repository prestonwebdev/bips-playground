import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardV4Demo from './experiments/DashboardV4Demo'
import Design from './pages/Design'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardV4Demo />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

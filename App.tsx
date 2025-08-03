import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Upload from '@/pages/Upload'
import WorkBoard from '@/pages/WorkBoard'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/workboard" element={<WorkBoard />} />
      </Routes>
    </Layout>
  )
}

export default App
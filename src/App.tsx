import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { ScrollToTop } from '@/components/navigation/ScrollToTop'

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App

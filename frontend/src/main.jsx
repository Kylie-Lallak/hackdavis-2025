import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from '../src/pages/Home'
import Footer from '../src/componets/Footer'
import Navbar from '../src/componets/Navbar'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Navbar />
    <Home />
    <Footer />
  </StrictMode>,
)

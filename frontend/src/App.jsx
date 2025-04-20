import { useState } from 'react'
import { Routes, Route } from 'react-router-dom' // ✅ Don't forget this
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Upload from './pages/Upload' // ✅ Make sure this exists

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/upload' element={<Upload />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App


import { useState } from 'react'
import { Routes, Route } from 'react-router-dom' // ✅ Don't forget this
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Home from './Pages/Home'
import Upload from './Pages/Upload' // ✅ Make sure this exists

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


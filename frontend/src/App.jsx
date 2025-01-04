import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/footer' element={<Footer />} />
      </Routes>
    </div>
  )
}

export default App
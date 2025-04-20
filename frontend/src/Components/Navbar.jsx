import React from 'react'
import '../Styles/Navbar.css'
import Logo from '../assets/paper.svg'



export default function Navbar() {
  return (
    <div id="navbar">
      <div id='nav-left'>
        <img src={Logo} id='logo'></img>
        <h3 className='gradient-text'>Clarity</h3>
      </div>
      <div id='nav-right'>
        <p className='trans-btn'>Login</p>
        <p className='gradient-btn'>Create Account</p>

      </div>
    </div>
  )
}

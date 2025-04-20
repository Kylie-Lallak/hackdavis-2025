import React from 'react'
import '../styles/Home.css'
import img from '../assets/UnBill.png'
import Arrow from '../assets/whitearrow.svg'
export default function Home() {
  return (
    <div id='home-page'>
  
      <div id='home-title-container'>
          <h1 id='home-text1'>Stop Over Paying on</h1>
          <h1 id='home-text2'>Medical Bills</h1>
          <p id='homeP'>Clarity uses AI to analyze your medical bills, identify errors, and create a personalized game plan to dispute faulty charges.</p>
          <p className='gradient-btn' id='home-button'>Upload Your Bill <img src={Arrow} id='home-arrow'/></p>

        </div>
        
     
      <img src={img} id='homeImg' />

      
      
       
    </div>
  )
}

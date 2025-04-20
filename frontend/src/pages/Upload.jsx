import React, { useState } from 'react'
import axios from 'axios'
import '../styles/Upload.css'
import Arrow from '../assets/hackarrow.svg'
import { Link } from 'react-router-dom'
import PDF from '../assets/upload.svg'

export default function Upload() {
  const [pdfFile, setPdfFile]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [fileName, setFileName]     = useState('')

  const handleFileChange = e => {
    const file = e.target.files[0]
    setPdfFile(file)
    setFileName(file ? file.name : '')  
    setError('')
    setScanResult(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!pdfFile) {
      setError('Please select a PDF file.')
      return
    }

    setLoading(true)
    setError('')
    setScanResult(null)

    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)

      const res = await axios.post(
        'http://localhost:3001/bills',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      let data = res.data.extractedText
      data = data.slice(7, data.length - 3)
      console.log(data)

      if (typeof data === 'string') {
        data = JSON.parse(data)
      }

      setScanResult(data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-page">
      <Link to="/" className="link-upload">
        <h6 className="upload-back">
          <img src={Arrow} className="back-arrow" />
          Back Home
        </h6>
      </Link>
      <h1 className="upload-title">Upload Your Medical Bill</h1>
      <p className="text">
        Our AI will analyze your bill to identify errors and create a dispute strategy
      </p>

      <div className="upload-container">
        <div className='box-header'>
          <h3> Upload Your Bill </h3>
          <p className='text'> Upload your medical bill PDF for AI analysis and dispute recommendations</p>
        </div>
        
        <form onSubmit={handleSubmit} className="">
          <label className="file-upload-label">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="upload-input"
            />
            <span className='inside-upload'>
              <img src={PDF} className='pdfImg'/> 
              <span className="choose-file-text">
                {fileName ? fileName : "Upload Your Bill"} 
              </span>
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="submitBtn"
          >
            {loading ? "Scanning…" : "Upload & Scan"}
          </button>
        </form>
      </div>

      <div className='upload-deatil'>
        <h2 className='info-title'>How it Works</h2>
        <ol>
          <li className='list-item'>Upload your medical bill PDF</li>
          <li  className='list-item'>Our AI scans the document to identify errors and overcharges</li>
          <li  className='list-item'>Review the analysis showing potential savings</li>
        </ol>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {scanResult && (
        <div className="result-container">
          <h2 className="result-title">Scan Results</h2>

          <h3 className="result-subtitle">All Line‑Items</h3>
          <ul className="result-list">
            {scanResult.items.map((item, i) => (
              <li key={i}>
                {item.name}: ${item.cost}
              </li>
            ))}
          </ul>

          <h3 className="result-subtitle">Suggested Disputes</h3>
          {scanResult.problem_items.length > 0 ? (
            <ul className="result-list">
              {scanResult.problem_items.map((p, i) => (
                <li key={i}>
                  <strong>Line #{p.index + 1}:</strong> {p.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text">No disputable charges found.</p>
          )}
        </div>
      )}
    </div>
  )
}

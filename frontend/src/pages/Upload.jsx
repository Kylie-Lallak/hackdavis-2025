// src/pages/DisputeBillPage.jsx
import React, { useState } from 'react'
import axios from 'axios'

export default function Upload() {
  const [pdfFile, setPdfFile]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [scanResult, setScanResult] = useState(null)

  const handleFileChange = e => {
    setPdfFile(e.target.files[0])
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

      // backend returns { extractedText: responseText }
      let data = res.data.extractedText
      data = data.slice(7, data.length - 3)
      console.log(data)

      // if it comes back as a stringified JSON:
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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dispute Your Medical Bill</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Scanning…' : 'Upload & Scan'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {scanResult && (
        <div>
          <h2 className="text-xl font-semibold mb-2">All Line‑Items</h2>
          <ul className="list-disc ml-6 mb-4">
            {scanResult.items.map((item, i) => (
              <li key={i}>
                {item.name}: ${item.cost}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-2">Suggested Disputes</h2>
          {scanResult.problem_items.length > 0 ? (
            <ul className="list-decimal ml-6">
              {scanResult.problem_items.map((p, i) => (
                <li key={i}>
                  <strong>Line #{p.index + 1}:</strong> {p.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>No disputable charges found.</p>
          )}
        </div>
      )}
    </div>
  )
}

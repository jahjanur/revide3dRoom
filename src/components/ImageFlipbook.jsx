import React, { useState, useEffect } from 'react'

const ImageFlipbook = ({ pdfUrl, onClose, isOpen, title = "PDF Content", onFallback }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pdfUrl || !isOpen) return

    const loadPDF = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Loading PDF from:", pdfUrl)
        
        // For now, we'll use a simple approach - convert PDF to images
        // This is a fallback when PDF.js doesn't work
        setTotalPages(1) // We'll show the PDF in an iframe for now
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading PDF:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    loadPDF()
  }, [pdfUrl, isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && currentPage > 1) setCurrentPage(currentPage - 1)
    if (e.key === 'ArrowRight' && currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentPage, totalPages])

  if (!isOpen) return null

  return (
    <div className="flipbook-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flipbook-container">
        <div className="flipbook-header">
          <h2>{title}</h2>
          <div className="page-info">
            Page {currentPage} of {totalPages || 'Loading...'}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="flipbook-canvas">
          {error ? (
            <div className="error-message">
              <h3>Error Loading PDF</h3>
              <p>{error}</p>
              <p>Please check if the PDF file exists and is accessible.</p>
              <button onClick={() => window.open(pdfUrl, '_blank')} className="fallback-btn">
                Open PDF in New Tab
              </button>
              {onFallback && (
                <button onClick={onFallback} className="fallback-btn" style={{ marginLeft: '10px' }}>
                  Try Simple Viewer
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading PDF...</p>
            </div>
          ) : (
            <div className="pdf-display-container">
              <iframe
                src={pdfUrl}
                className="pdf-iframe"
                width="100%"
                height="600px"
                style={{ 
                  minHeight: '500px', 
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                title={title}
              />
              <div className="pdf-actions">
                <a 
                  href={pdfUrl}
                  download
                  className="pdf-download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📥 Download PDF
                </a>
                <a 
                  href={pdfUrl}
                  className="pdf-open-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Open in New Tab
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageFlipbook

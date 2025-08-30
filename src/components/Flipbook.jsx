import React, { useState, useEffect } from "react"

const Flipbook = ({ pdfUrl, onClose, isOpen, title = "PDF Content", onFallback }) => {
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pageCanvases, setPageCanvases] = useState([])
  const [error, setError] = useState(null)
  const [zoomedPage, setZoomedPage] = useState(null)
  const [zoomedPageCanvas, setZoomedPageCanvas] = useState(null)
  const [isZoomLoading, setIsZoomLoading] = useState(false)

  useEffect(() => {
    if (!pdfUrl || !isOpen) return

    const loadPDF = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Loading PDF from:", pdfUrl)
        
        // Use a more reliable worker source
        const pdfjsLib = await import("pdfjs-dist")
        console.log("PDF.js version:", pdfjsLib.version)
        
        // Use local worker from public directory
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        
        console.log("Loading PDF document...")
        const loadingTask = pdfjsLib.getDocument(pdfUrl)
        
        const pdf = await loadingTask.promise
        console.log("PDF loaded successfully, pages:", pdf.numPages)
        
        setTotalPages(pdf.numPages)
        
        const canvases = []
        // Render all pages for full flipbook experience
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          console.log(`Rendering page ${pageNum}...`)
          const canvas = await renderPage(pdf, pageNum, 1.2) // Balanced scale for quality and performance
          if (canvas) {
            canvases.push(canvas)
          }
        }
        
        console.log("Rendered canvases:", canvases.length)
        setPageCanvases(canvases)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading PDF:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    loadPDF()
  }, [pdfUrl, isOpen])

  const renderPage = async (pdf, pageNum, scale = 1.2) => {
    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: scale })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      return canvas
    } catch (error) {
      console.error("Error rendering page:", error)
      return null
    }
  }

  const renderHighQualityPage = async (pdf, pageNum, scale = 2.5) => {
    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: scale })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      return canvas
    } catch (error) {
      console.error("Error rendering high quality page:", error)
      return null
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (zoomedPage !== null) {
        setZoomedPage(null)
      } else {
        onClose()
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="flipbook-overlay">
      <div className="flipbook-container">
        <div className="flipbook-header">
          <h2>{title}</h2>
          <div className="page-info">
            {totalPages} Pages
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
          ) : (
            <div className="pages-grid">
              {pageCanvases.map((canvas, index) => (
                <div key={index} className="page-container">
                  <div className="page-number">Page {index + 1}</div>
                  <div className="page-wrapper">
                    {canvas && (
                      <img 
                        src={canvas.toDataURL()} 
                        alt={`Page ${index + 1}`}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          transition: "transform 0.2s ease"
                        }}
                        onClick={async () => {
                          setZoomedPage(index)
                          setIsZoomLoading(true)
                          try {
                            const pdfjsLib = await import("pdfjs-dist")
                            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
                            const loadingTask = pdfjsLib.getDocument(pdfUrl)
                            const pdf = await loadingTask.promise
                            const highQualityCanvas = await renderHighQualityPage(pdf, index + 1)
                            setZoomedPageCanvas(highQualityCanvas)
                          } catch (error) {
                            console.error("Error rendering high quality page:", error)
                          } finally {
                            setIsZoomLoading(false)
                          }
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading PDF pages...</p>
          </div>
        )}
      </div>
      
      {/* Zoomed Page View */}
      {zoomedPage !== null && (
        <div className="zoomed-page-overlay" onClick={() => {
          setZoomedPage(null)
          setZoomedPageCanvas(null)
        }}>
          <div className="zoomed-page-container" onClick={(e) => e.stopPropagation()}>
            <div className="zoomed-page-header">
              <h3>Page {zoomedPage + 1} - High Quality View</h3>
              <div className="zoom-controls">
                <button 
                  className="zoom-btn"
                  onClick={() => window.open(pdfUrl, '_blank')}
                  title="Open PDF in New Tab"
                >
                  🔗
                </button>
                <button 
                  className="zoom-btn"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = pdfUrl
                    link.download = `page-${zoomedPage + 1}.pdf`
                    link.click()
                  }}
                  title="Download PDF"
                >
                  📥
                </button>
                <button className="close-btn" onClick={() => {
                  setZoomedPage(null)
                  setZoomedPageCanvas(null)
                }}>×</button>
              </div>
            </div>
            <div className="zoomed-page-content">
              {isZoomLoading ? (
                <div className="zoom-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading high quality view...</p>
                </div>
              ) : zoomedPageCanvas ? (
                <div className="high-quality-page">
                  <img 
                    src={zoomedPageCanvas.toDataURL()} 
                    alt={`Page ${zoomedPage + 1} - High Quality`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "75vh",
                      height: "auto",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
                    }}
                  />
                </div>
              ) : (
                <div className="fallback-page">
                  <img 
                    src={pageCanvases[zoomedPage]?.toDataURL()} 
                    alt={`Page ${zoomedPage + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "75vh",
                      height: "auto",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Flipbook

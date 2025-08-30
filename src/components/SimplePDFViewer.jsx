import React from 'react'

const SimplePDFViewer = ({ pdfUrl, onClose, isOpen, title = "PDF Content" }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="pdf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pdf-modal-content">
        <div className="pdf-modal-header">
          <h2 className="pdf-modal-title">{title}</h2>
          <button className="pdf-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="pdf-modal-body">
          <div className="pdf-container">
            <iframe
              src={pdfUrl}
              className="pdf-viewer"
              width="100%"
              height="600px"
              style={{ minHeight: '400px', border: 'none' }}
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
        </div>
      </div>
    </div>
  )
}

export default SimplePDFViewer

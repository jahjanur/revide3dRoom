import React, { useEffect, useRef } from 'react'

const PDFModal = ({ open, onClose, pdfPath, title }) => {
  const modalRef = useRef(null)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEsc)
      // Focus trap: focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus()
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  // Handle backdrop click to close modal
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="pdf-modal-backdrop" onClick={handleBackdropClick}>
      <div 
        className="pdf-modal-content" 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="pdf-modal-title"
      >
        <div className="pdf-modal-header">
          <h2 id="pdf-modal-title" className="pdf-modal-title">
            {title}
          </h2>
          <button 
            className="pdf-modal-close" 
            onClick={onClose}
            aria-label="Close PDF modal"
          >
            ×
          </button>
        </div>
        
        <div className="pdf-modal-body">
          <div className="pdf-container">
            <embed
              src={pdfPath}
              type="application/pdf"
              className="pdf-viewer"
              width="100%"
              height="100%"
              style={{ minHeight: '400px' }}
            />
            <div className="pdf-actions">
              <a 
                href={pdfPath}
                download
                className="pdf-download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 Download PDF
              </a>
              <a 
                href={pdfPath}
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

export default PDFModal

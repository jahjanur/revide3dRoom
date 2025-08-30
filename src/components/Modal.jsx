import React, { useEffect, useRef } from 'react'

const Modal = ({ open, onClose, sponsor }) => {
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

  if (!open || !sponsor) return null

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div 
        className="modal-content" 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {sponsor.title}
          </h2>
        </div>
        
        {sponsor.image && (
          <div className="modal-image-container">
            {sponsor.image.toLowerCase().endsWith('.pdf') ? (
              <div className="pdf-container">
                <embed
                  src={sponsor.image}
                  type="application/pdf"
                  className="pdf-viewer"
                  width="100%"
                  height="400px"
                />
                <a 
                  href={sponsor.image}
                  download
                  className="pdf-download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📥 Download PDF
                </a>
              </div>
            ) : (
              <img 
                src={sponsor.image} 
                alt={`${sponsor.title} image`}
                className="modal-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
          </div>
        )}
        
        <p id="modal-description" className="modal-description">
          {sponsor.description}
        </p>
        
        {sponsor.gallery && sponsor.gallery.length > 0 && (
          <div className="modal-gallery">
            <h3 className="gallery-title">Gallery</h3>
            <div className="gallery-grid">
              {sponsor.gallery.map((image, index) => (
                <div key={index} className="gallery-item">
                  <img 
                    src={image} 
                    alt={`${sponsor.title} gallery image ${index + 1}`}
                    className="gallery-image"
                    onClick={() => window.open(image, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <a 
          href={sponsor.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="modal-cta"
        >
          {sponsor.ctaText}
        </a>
      </div>
    </div>
  )
}

export default Modal

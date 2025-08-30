import React, { useState, useEffect, useRef } from 'react'

const WEBSITE_URL = 'https://example.com' // Easy to change constant

const IframeOverlay = ({ open, onClose }) => {
  const [iframeError, setIframeError] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef(null)
  const headerRef = useRef(null)

  // Reset state when overlay opens/closes
  useEffect(() => {
    if (open) {
      setIframeError(false)
      setIframeLoaded(false)
    }
  }, [open])

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEsc)
      // Focus trap: focus the header when overlay opens
      if (headerRef.current) {
        headerRef.current.focus()
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  // Handle iframe load success
  const handleIframeLoad = () => {
    setIframeLoaded(true)
    setIframeError(false)
  }

  // Handle iframe load error (blocked by X-Frame-Options or CSP)
  const handleIframeError = () => {
    setIframeError(true)
    setIframeLoaded(false)
  }

  // Handle iframe load timeout
  useEffect(() => {
    if (open && !iframeLoaded && !iframeError) {
      const timeout = setTimeout(() => {
        setIframeError(true)
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [open, iframeLoaded, iframeError])

  if (!open) return null

  return (
    <div className="iframe-overlay">
      <div className="iframe-header" ref={headerRef} tabIndex={-1}>
        <div className="iframe-url" title={WEBSITE_URL}>
          {WEBSITE_URL}
        </div>
        <button 
          className="iframe-close" 
          onClick={onClose}
          aria-label="Close iframe overlay"
        >
          Close
        </button>
      </div>
      
      <div className="iframe-content">
        {iframeError ? (
          <div className="iframe-fallback">
            <div className="iframe-fallback-icon">🔒</div>
            <h2 className="iframe-fallback-title">Website Cannot Be Embedded</h2>
            <p className="iframe-fallback-message">
              This website has security settings that prevent it from being displayed 
              in an iframe. You can still visit the website in a new tab.
            </p>
            <a 
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="iframe-fallback-button"
            >
              Open in New Tab
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={WEBSITE_URL}
            title="External Website"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ 
              opacity: iframeLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        )}
      </div>
    </div>
  )
}

export default IframeOverlay

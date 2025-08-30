import React, { useState, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import Room from './components/Room'
import Background from './components/Background'
import Modal from './components/Modal'
import Flipbook from './components/Flipbook'
import SimplePDFViewer from './components/SimplePDFViewer'
import IframeOverlay from './components/IframeOverlay'
import WindowLights from './components/WindowLights'
import sponsorsData from './data/sponsors.json'
import publicationsData from './data/publications.json'

// Initialize RectAreaLight uniforms
RectAreaLightUniformsLib.init()

function App() {
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [selectedPublishing, setSelectedPublishing] = useState(null)
  const [showFlipbook, setShowFlipbook] = useState(false)
  const [showSimplePDF, setShowSimplePDF] = useState(false)
  const [flipbookData, setFlipbookData] = useState({ path: '', title: '' })
  const controlsRef = useRef()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentView, setCurrentView] = useState(null) // null, 'home', 'sponsorships', 'publishing'
  const [modelQuality, setModelQuality] = useState('high') // 'low', 'medium', 'high'
  const [isLoading, setIsLoading] = useState(true)

  const handleOpenFrame = (frameIndex) => {
    setSelectedFrame(frameIndex)
  }

  const handleCloseFrame = () => {
    setSelectedFrame(null)
  }
  
  const handleOpenPublishing = (publishingIndex) => {
    // Try Flipbook first, fallback to Simple PDF Viewer if needed
    if (publishingIndex === 0) {
      // Publishing1 - Immomedien
      handleOpenFlipbook('/publications/immomedien/Publishing1_Content.pdf', 'Immomedien - Haus & Verwaltung - Full Content')
    } else if (publishingIndex === 1) {
      // Publishing2 - Panoptikum
      handleOpenFlipbook('/publications/panoptikum/Publishing2_Content.pdf', 'Panoptikum - Publishing2 Content')
    }
  }

  const handleClosePublishing = () => {
    setSelectedPublishing(null)
  }

  const handleOpenFlipbook = (pdfPath, title) => {
    setFlipbookData({ path: pdfPath, title: title })
    setShowFlipbook(true)
  }

  const handleCloseFlipbook = () => {
    setShowFlipbook(false)
  }

  const handleOpenSimplePDF = (pdfPath, title) => {
    setFlipbookData({ path: pdfPath, title: title })
    setShowSimplePDF(true)
  }

  const handleCloseSimplePDF = () => {
    setShowSimplePDF(false)
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  const handleNavigateToSponsorships = () => {
    setCurrentView('sponsorships')
    // Close any open modals
    setSelectedFrame(null)
    setSelectedPublishing(null)
  }

  const handleNavigateToPublishing = () => {
    setCurrentView('publishing')
    // Close any open modals
    setSelectedFrame(null)
    setSelectedPublishing(null)
  }

  const handleModelLoaded = () => {
    setIsLoading(false)
  }
  
  const handleNavigateToHome = () => {
    setCurrentView('home')
    // Close any open modals
    setSelectedFrame(null)
    setSelectedPublishing(null)
  }
  
  const handleHomeButtonClick = () => {
    setCurrentView('home')
    // Close any open modals
    setSelectedFrame(null)
    setSelectedPublishing(null)
    // Signal that home button was explicitly clicked
    setTimeout(() => {
      // This will trigger the TV zoom animation
    }, 100)
  }



  return (
    <div className="canvas-container" onMouseMove={handleMouseMove}>
      <div 
        className="interactive-background"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #BCA375 0%, #000000 50%, #000000 100%)`,
          transition: 'background 0.3s ease-out'
        }}
      />
      {/* Modern Loader */}
      {isLoading && (
        <div className="modern-loader">
          <div className="loader-container">
            <div className="loader-logo">
              <div className="logo-text">3D</div>
              <div className="logo-subtitle">ROOM</div>
            </div>
            
            <div className="loader-bar">
              <div className="loader-progress"></div>
            </div>
            
            <div className="loader-text">Loading Experience</div>
            
            <div className="loader-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Navigation - Right Side */}
      {!isLoading && (
        <div className="navigation-buttons">
          <button 
            className={`nav-btn ${currentView === 'sponsorships' ? 'active' : ''}`}
            onClick={handleNavigateToSponsorships}
          >
            Sponsorships
          </button>
          <button 
            className={`nav-btn ${currentView === 'publishing' ? 'active' : ''}`}
            onClick={handleNavigateToPublishing}
          >
            Publishing
          </button>
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={handleHomeButtonClick}
          >
            Home Page
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {!isLoading && (
        <div className="mobile-nav-bar">
          <div 
            className={`mobile-nav-item ${currentView === 'publishing' ? 'active' : ''}`}
            onClick={handleNavigateToPublishing}
          >
            <div className="mobile-nav-icon">📚</div>
            <div className="mobile-nav-text">Publishing</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={handleHomeButtonClick}
          >
            <div className="mobile-nav-icon home">🏠</div>
            <div className="mobile-nav-text home">Home</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${currentView === 'sponsorships' ? 'active' : ''}`}
            onClick={handleNavigateToSponsorships}
          >
            <div className="mobile-nav-icon">💼</div>
            <div className="mobile-nav-text">Sponsors</div>
          </div>
        </div>
      )}
      

      
      <Canvas
        camera={{
          position: [2.2, 1.8, 4.8],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.4 // Enhanced for ultra-realism
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.shadowMap.autoUpdate = true
          gl.physicallyCorrectLights = true // Correct light falloff
          
          // Ultra-realistic shadow settings
          gl.shadowMap.minFilter = THREE.LinearFilter
          gl.shadowMap.magFilter = THREE.LinearFilter
          gl.shadowMap.generateMipmaps = false
          
          // Enhanced rendering quality
          gl.antialias = true
          gl.powerPreference = "high-performance"
          gl.alpha = true
          
          // Better color management
          gl.outputEncoding = THREE.sRGBEncoding
        }}
      >
        {/* Ultra-Realistic Lighting Setup */}
        <Environment preset="sunset" background={false} />
        
        {/* Enhanced HDR Lighting System */}
        <ambientLight intensity={0.08} color="#ffffff" />
        
        {/* Main directional light with ultra-realistic shadows */}
        <directionalLight
          position={[5, 12, 5]}
          intensity={1.5}
          color="#fff8f0"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={60}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.00005}
          shadow-normalBias={0.01}
        />
        
        {/* Fill light for natural shadows */}
        <directionalLight
          position={[-4, 10, -4]}
          intensity={0.6}
          color="#e6f3ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.00005}
          shadow-normalBias={0.01}
        />
        
        {/* Rim light for depth and separation */}
        <directionalLight
          position={[0, 8, -8]}
          intensity={0.3}
          color="#fff0e6"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={25}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.00005}
          shadow-normalBias={0.01}
        />
        
        {/* Subtle upward light for ambient fill */}
        <directionalLight
          position={[0, -2, 0]}
          intensity={0.1}
          color="#f0f8ff"
          castShadow={false}
        />
        
        {/* Window Lighting System */}
        <WindowLights />
        
        {/* 3D Room */}
        <Suspense fallback={null}>
          <Room 
            onOpenFrame={handleOpenFrame}
            onOpenPublishing={handleOpenPublishing}
            controlsRef={controlsRef}
            currentView={currentView}
            onModelLoaded={handleModelLoaded}
            onNavigateToHome={handleHomeButtonClick}
            modelQuality={modelQuality}
          />
        </Suspense>
        
        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={window.innerWidth <= 768 ? 1.0 : 1.2}
          maxDistance={window.innerWidth <= 768 ? 20 : 30}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          target={[0, 1, 0]}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Frame Modal */}
      <Modal 
        open={selectedFrame !== null}
        sponsor={selectedFrame !== null ? sponsorsData[selectedFrame] : null} 
        onClose={handleCloseFrame}
      />
      

      
      {/* Publishing Guide Overlay */}
      {currentView === 'publishing' && (
        <div className="publishing-guide-overlay">
          <div className="guide-text">
            <h3>Publishing Section</h3>
            <p>Click on any of the publishing objects to view their full content and download the publications.</p>
          </div>
        </div>
      )}

      {/* Publication Modals - Disabled since we're opening PDFs directly */}
      {/* 
      {selectedPublishing === 0 && (
        <div className="publication-modal-overlay">
          <div className="publication-modal">
            <div className="publication-header">
              <h2>Immomedien - Haus & Verwaltung</h2>
              <button className="close-btn" onClick={handleClosePublishing}>×</button>
            </div>
            <div className="publication-content">
              <div className="publication-image">
                <img 
                  src="/publications/immomedien/Publishing1_Material.png" 
                  alt="Immomedien Publication"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <div className="publication-text">
                <p>Immomedien - Haus & Verwaltung is a comprehensive publication covering real estate management and administration. This publication provides insights into property management, administrative processes, and industry best practices for real estate professionals.</p>
                <button className="view-pdf-btn" onClick={() => handleOpenPDFModal('/publications/immomedien/Publishing1_Content.pdf', 'Immomedien - Haus & Verwaltung - Full Content')}>View PDF Content</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPublishing === 1 && (
        <div className="publication-modal-overlay">
          <div className="publication-modal">
            <div className="publication-header">
              <h2>Panoptikum</h2>
              <button className="close-btn" onClick={handleClosePublishing}>×</button>
            </div>
            <div className="publication-content">
              <div className="publication-image">
                <img 
                  src="/publications/panoptikum/Publishing2_Material.png" 
                  alt="Panoptikum Publication"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <div className="publication-text">
                <p>Panoptikum is a specialized publication that showcases innovative projects and developments. This edition features the Revide Group and highlights their latest achievements and contributions to the industry.</p>
                <button className="view-pdf-btn" onClick={() => handleOpenPDFModal('/publications/panoptikum/Revide Group 1.pdf', 'Panoptikum - Revide Group')}>View PDF Content</button>
              </div>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Simple PDF Viewer for Publication Content */}
      <SimplePDFViewer
        pdfUrl={flipbookData.path}
        isOpen={showSimplePDF}
        onClose={handleCloseSimplePDF}
        title={flipbookData.title}
      />
      
      {/* Flipbook PDF Viewer */}
      <Flipbook
        pdfUrl={flipbookData.path}
        isOpen={showFlipbook}
        onClose={handleCloseFlipbook}
        title={flipbookData.title}
        onFallback={() => {
          handleCloseFlipbook()
          handleOpenSimplePDF(flipbookData.path, flipbookData.title)
        }}
      />

    </div>
  )
}

export default App

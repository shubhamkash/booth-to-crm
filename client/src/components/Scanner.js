import React, { useState, useRef, useEffect } from 'react';
import { Scanner } from '../utils/scanner';

const ScannerComponent = ({ onScanResult, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('qr'); // 'qr' or 'card'
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scanMode === 'qr') {
      startQRScanning();
    }
    
    return () => {
      cleanup();
    };
  }, [scanMode]);

  const startQRScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      qrScannerRef.current = await Scanner.scanQR(videoRef.current);
      
      qrScannerRef.current.onDecode = (result) => {
        const data = Scanner.parseQRData(result.data);
        handleScanSuccess(data);
      };
      
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const handleCardUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setError('');
      
      const data = await Scanner.scanBusinessCard(file);
      handleScanSuccess(data);
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (data) => {
    cleanup();
    onScanResult(data);
  };

  const cleanup = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  return (
    <div className="camera-overlay">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <button onClick={handleClose} className="text-xl">✕</button>
        <h2 className="text-lg font-medium">
          {scanMode === 'qr' ? 'Scan QR Code' : 'Scan Business Card'}
        </h2>
        <div></div>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-black/80 px-4 pb-4">
        <button
          onClick={() => setScanMode('qr')}
          className={`flex-1 py-2 px-4 rounded-l-lg ${
            scanMode === 'qr' ? 'bg-primary-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          QR Code
        </button>
        <button
          onClick={() => setScanMode('card')}
          className={`flex-1 py-2 px-4 rounded-r-lg ${
            scanMode === 'card' ? 'bg-primary-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Business Card
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        {scanMode === 'qr' ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8">
              <div className="mb-6">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-lg mb-4">Take a photo of the business card</p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                disabled={isScanning}
              >
                {isScanning ? 'Processing...' : 'Choose Photo'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCardUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {scanMode === 'qr' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-black/80 text-white p-4 text-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : isScanning ? (
          <p className="text-primary-400">
            {scanMode === 'qr' ? 'Position QR code in the frame' : 'Processing image...'}
          </p>
        ) : (
          <p className="text-gray-400">
            {scanMode === 'qr' ? 'Camera loading...' : 'Ready to scan'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScannerComponent;
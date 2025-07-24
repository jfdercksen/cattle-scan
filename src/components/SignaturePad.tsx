
import { useRef, useState, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signaturePadController } from '@/lib/signaturePadController';

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  signature?: string | null;
}

interface DeviceInfo {
  isMobile: boolean;
  devicePixelRatio: number;
  touchSupport: boolean;
}



export function SignaturePad({ onSignatureChange, signature }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 200 });
  const [signatureQuality, setSignatureQuality] = useState<'poor' | 'fair' | 'good' | 'excellent' | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    devicePixelRatio: 1,
    touchSupport: false,
  });

  // Detect device capabilities and set up touch calibration
  useEffect(() => {
    const updateDeviceInfo = () => {
      signaturePadController.updateDeviceInfo();
      const info = signaturePadController.getDeviceInfo();
      setDeviceInfo({
        isMobile: info.isMobile,
        devicePixelRatio: info.devicePixelRatio,
        touchSupport: info.touchSupport,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Calculate responsive canvas size using controller
  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const size = signaturePadController.calculateCanvasSize(containerWidth);
      setCanvasSize(size);
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Set up touch calibration when canvas is ready
  useEffect(() => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      if (canvas && deviceInfo.touchSupport) {
        signaturePadController.calibrateTouchInput(canvas);
        // Apply enhanced touch accuracy
        signaturePadController.enhanceTouchAccuracy(sigCanvas.current);
      }
    }
  }, [deviceInfo.touchSupport, canvasSize]);

  // Enhanced clear function with proper reset
  const clear = useCallback(() => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      if (canvas) {
        signaturePadController.resetSignaturePad(canvas);
      }
      sigCanvas.current.clear();
      setIsEmpty(true);
      setSignatureQuality(null);
      onSignatureChange(null);
    }
  }, [onSignatureChange]);

  // Enhanced save function with quality optimization
  const save = useCallback(() => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      // Use higher quality for mobile devices
      const quality = deviceInfo.isMobile ? 0.9 : 0.8;
      const signatureData = sigCanvas.current.toDataURL('image/png', quality);
      onSignatureChange(signatureData);
      setIsEmpty(false);
    }
  }, [onSignatureChange, deviceInfo.isMobile]);

  // Handle signature end with touch calibration and quality check
  const handleEnd = useCallback(() => {
    if (sigCanvas.current) {
      const currentIsEmpty = sigCanvas.current.isEmpty();
      setIsEmpty(currentIsEmpty);
      
      // Check signature quality
      if (!currentIsEmpty) {
        const canvas = sigCanvas.current.getCanvas();
        if (canvas) {
          const validation = signaturePadController.validateSignatureAccuracy(canvas);
          setSignatureQuality(validation.quality);
        }
        
        // Auto-save on mobile for better UX
        if (deviceInfo.isMobile) {
          save();
        }
      } else {
        setSignatureQuality(null);
      }
    }
  }, [save, deviceInfo.isMobile]);

  // Handle signature begin for touch calibration
  const handleBegin = useCallback(() => {
    // Ensure proper touch handling is set up
    if (deviceInfo.touchSupport && sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      if (canvas) {
        // Prevent default touch behaviors that might interfere
        canvas.style.touchAction = 'none';
      }
    }
  }, [deviceInfo.touchSupport]);

  // Canvas properties optimized for touch accuracy
  const canvasProps = {
    width: canvasSize.width,
    height: canvasSize.height,
    className: 'signature-canvas w-full h-full touch-none',
    style: {
      width: '100%',
      height: '100%',
      touchAction: 'none', // Prevent scrolling and zooming
    },
  };

  // Signature canvas options for better touch response
  const signatureOptions = {
    minWidth: deviceInfo.isMobile ? 1.5 : 1,
    maxWidth: deviceInfo.isMobile ? 3.5 : 3,
    penColor: '#000000',
    backgroundColor: '#ffffff',
    velocityFilterWeight: deviceInfo.isMobile ? 0.8 : 0.5, // More smoothing for mobile
    throttle: deviceInfo.isMobile ? 8 : 32, // Much higher frequency for mobile touch
    dotSize: deviceInfo.isMobile ? 2 : 1, // Larger dots for mobile
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Digital Signature
          {deviceInfo.isMobile && (
            <span className="text-xs text-gray-500 font-normal">
              Touch optimized
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={containerRef}
          className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden"
          style={{ minHeight: '150px' }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={canvasProps}
            onEnd={handleEnd}
            onBegin={handleBegin}
            {...signatureOptions}
          />
        </div>
        
        {/* Touch accuracy indicator for mobile */}
        {deviceInfo.isMobile && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            💡 Tip: Touch accuracy has been calibrated for your device. Sign naturally - your signature will be saved automatically.
          </div>
        )}
        
        {/* Signature quality indicator */}
        {signatureQuality && !isEmpty && (
          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
            signatureQuality === 'excellent' ? 'bg-green-50 text-green-700' :
            signatureQuality === 'good' ? 'bg-blue-50 text-blue-700' :
            signatureQuality === 'fair' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            <span>
              {signatureQuality === 'excellent' ? '✅' :
               signatureQuality === 'good' ? '👍' :
               signatureQuality === 'fair' ? '⚠️' : '❌'}
            </span>
            <span>
              Signature quality: {signatureQuality}
              {signatureQuality === 'poor' && ' - Consider signing again for better clarity'}
            </span>
          </div>
        )}
        
        {signature && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Signature:</p>
            <img 
              src={signature} 
              alt="Signature" 
              className="border rounded max-h-24 w-auto" 
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            type="button" 
            variant="outline" 
            onClick={clear}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            Clear Signature
          </Button>
          {!deviceInfo.isMobile && (
            <Button 
              type="button" 
              onClick={save}
              size="sm"
              disabled={isEmpty && !signature}
              className="flex-1 sm:flex-none"
            >
              Save Signature
            </Button>
          )}
          {/* Touch calibration test button for development */}
          {process.env.NODE_ENV === 'development' && deviceInfo.isMobile && (
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => {
                if (sigCanvas.current) {
                  const canvas = sigCanvas.current.getCanvas();
                  if (canvas) {
                    signaturePadController.testTouchAccuracy(canvas);
                  }
                }
              }}
              size="sm"
              className="text-xs"
            >
              Test Calibration
            </Button>
          )}
        </div>
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500">
            <summary>Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
              <div>Touch Support: {deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
              <div>Device Pixel Ratio: {deviceInfo.devicePixelRatio}</div>
              <div>Canvas Size: {canvasSize.width}x{canvasSize.height}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

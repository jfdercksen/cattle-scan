/**
 * Signature Pad Controller
 * 
 * Handles touch calibration and accuracy improvements for signature capture
 * across different mobile devices and screen configurations.
 */

export interface DeviceInfo {
  isMobile: boolean;
  devicePixelRatio: number;
  touchSupport: boolean;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
}

export interface TouchOffset {
  x: number;
  y: number;
  scaleFactor: number;
}

export interface SignatureOptions {
  minWidth: number;
  maxWidth: number;
  penColor: string;
  backgroundColor: string;
  velocityFilterWeight: number;
  throttle: number;
}

export class SignaturePadController {
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceInfo = this.detectDevice();
  }

  /**
   * Detect device capabilities and characteristics
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      (window.innerWidth <= 768);
    const devicePixelRatio = window.devicePixelRatio || 1;
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      isMobile,
      devicePixelRatio,
      touchSupport,
      userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    };
  }

  /**
   * Calculate touch offset for accurate positioning
   */
  calculateTouchOffset(canvas: HTMLCanvasElement): TouchOffset {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Base offset calculations
    let offsetX = 0;
    let offsetY = 0;

    // Device-specific calibrations
    if (this.deviceInfo.isMobile) {
      const userAgent = this.deviceInfo.userAgent;

      // iOS devices - finger touch point is typically above the visual contact
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        offsetY = -8; // More significant upward adjustment for iOS
        offsetX = 0;

        // iPhone specific adjustments
        if (/iPhone/i.test(userAgent)) {
          if (this.deviceInfo.screenWidth <= 375) { // iPhone SE, 6, 7, 8
            offsetY = -6;
          } else if (this.deviceInfo.screenWidth <= 414) { // iPhone 6+, 7+, 8+
            offsetY = -10;
          } else { // iPhone X and newer
            offsetY = -8;
          }
        }
      }

      // Android devices - varies by manufacturer
      else if (/Android/i.test(userAgent)) {
        offsetY = -4; // General Android adjustment
        offsetX = 0;

        // Samsung devices
        if (/Samsung/i.test(userAgent)) {
          offsetY = -6;
        }
        // Google Pixel devices
        else if (/Pixel/i.test(userAgent)) {
          offsetY = -5;
        }
        // OnePlus devices
        else if (/OnePlus/i.test(userAgent)) {
          offsetY = -4;
        }
      }

      // High DPI displays need proportional scaling
      if (this.deviceInfo.devicePixelRatio > 2) {
        const dprFactor = Math.min(this.deviceInfo.devicePixelRatio / 2, 2);
        offsetX *= dprFactor;
        offsetY *= dprFactor;
      }

      // Adjust for canvas scaling
      offsetX /= scaleX;
      offsetY /= scaleY;
    }

    return {
      x: offsetX,
      y: offsetY,
      scaleFactor: Math.min(scaleX, scaleY),
    };
  }

  /**
   * Get optimized signature options based on device
   */
  getSignatureOptions(): SignatureOptions {
    const baseOptions: SignatureOptions = {
      minWidth: 1,
      maxWidth: 3,
      penColor: '#000000',
      backgroundColor: '#ffffff',
      velocityFilterWeight: 0.5,
      throttle: 32,
    };

    if (this.deviceInfo.isMobile) {
      return {
        ...baseOptions,
        minWidth: 2, // Thicker lines for mobile
        maxWidth: 4,
        velocityFilterWeight: 0.7, // More smoothing for touch
        throttle: 16, // Higher frequency for better touch response
      };
    }

    return baseOptions;
  }

  /**
   * Calculate responsive canvas size
   */
  calculateCanvasSize(containerWidth: number): { width: number; height: number } {
    const maxWidth = Math.min(containerWidth - 32, 600); // 16px padding, max 600px
    const aspectRatio = 2.5; // width:height ratio

    let width = Math.max(300, maxWidth); // minimum 300px width
    let height = Math.max(120, width / aspectRatio); // minimum 120px height

    // Adjust for mobile devices
    if (this.deviceInfo.isMobile) {
      // Use more of the available width on mobile
      width = Math.max(280, containerWidth - 16);
      height = Math.max(140, width / 2.2); // Slightly taller ratio for mobile

      // Ensure it fits in viewport
      const maxHeight = window.innerHeight * 0.3; // Max 30% of viewport height
      if (height > maxHeight) {
        height = maxHeight;
        width = height * 2.2;
      }
    }

    // Ensure dimensions are even numbers for better rendering
    width = Math.floor(width / 2) * 2;
    height = Math.floor(height / 2) * 2;

    return { width, height };
  }

  /**
   * Get corrected touch coordinates for accurate signature capture
   */
  getCorrectedTouchCoordinates(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const touchOffset = this.calculateTouchOffset(canvas);

    // Calculate base coordinates
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Apply device-specific corrections
    x += touchOffset.x;
    y += touchOffset.y;

    // Scale coordinates to canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    x *= scaleX;
    y *= scaleY;

    // Ensure coordinates are within canvas bounds
    x = Math.max(0, Math.min(canvas.width, x));
    y = Math.max(0, Math.min(canvas.height, y));

    return { x, y };
  }

  /**
   * Calibrate touch input for accurate signature capture
   */
  calibrateTouchInput(canvas: HTMLCanvasElement): void {
    if (!this.deviceInfo.touchSupport) return;

    // Prevent default touch behaviors
    canvas.style.touchAction = 'none';

    // IE/Edge support - safely set msTouchAction if it exists
    const canvasStyleAny = canvas.style as any;
    if ('msTouchAction' in canvasStyleAny) {
      canvasStyleAny.msTouchAction = 'none';
    }

    // Ensure proper canvas styling for touch
    canvas.style.userSelect = 'none';
    // Webkit-specific properties - use type assertion for vendor prefixes
    (canvas.style as any).webkitUserSelect = 'none';
    (canvas.style as any).webkitTouchCallout = 'none';

    // Add meta viewport tag if not present (for mobile optimization)
    if (this.deviceInfo.isMobile && !document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }
  }

  /**
   * Apply touch accuracy improvements to signature canvas
   */
  enhanceTouchAccuracy(signatureCanvas: any): void {
    if (!this.deviceInfo.touchSupport || !signatureCanvas) return;

    const canvas = signatureCanvas.getCanvas();
    if (!canvas) return;

    // Store reference to original methods
    const originalFromEvent = signatureCanvas._fromEvent?.bind(signatureCanvas);

    // Override the coordinate extraction method for better accuracy
    if (originalFromEvent) {
      signatureCanvas._fromEvent = (event: any) => {
        // Get the original point
        const originalPoint = originalFromEvent(event);

        if (event.type.includes('touch') && event.touches && event.touches[0]) {
          const touch = event.touches[0];
          const corrected = this.getCorrectedTouchCoordinates(canvas, touch.clientX, touch.clientY);

          // Return corrected coordinates
          return {
            x: corrected.x,
            y: corrected.y,
            time: originalPoint.time || Date.now(),
          };
        }

        return originalPoint;
      };
    }

    // Add additional touch event listeners for fine-tuning
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      // Ensure canvas focus for better touch handling
      canvas.focus();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      // Clean up any touch state
    };

    // Remove existing listeners to avoid duplicates
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);

    // Add new listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  /**
   * Test touch accuracy by drawing a calibration pattern
   */
  testTouchAccuracy(canvas: HTMLCanvasElement): void {
    if (!this.deviceInfo.isMobile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw calibration grid for testing
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw center crosshair
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();
  }

  /**
   * Validate signature accuracy and quality
   */
  validateSignatureAccuracy(canvas: HTMLCanvasElement): {
    isValid: boolean;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    metrics: {
      pixelRatio: number;
      strokeCount: number;
      averageStrokeLength: number;
    };
  } {
    const ctx = canvas.getContext('2d');
    if (!ctx) return {
      isValid: false,
      quality: 'poor',
      metrics: { pixelRatio: 0, strokeCount: 0, averageStrokeLength: 0 }
    };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalPixels = 0;
    let signaturePixels = 0;
    let strokePixels: Array<{ x: number, y: number }> = [];

    // Analyze pixel data
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        totalPixels++;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check if pixel is part of signature (not white/transparent)
        if (!(r === 255 && g === 255 && b === 255) && a > 0) {
          signaturePixels++;
          strokePixels.push({ x, y });
        }
      }
    }

    const pixelRatio = signaturePixels / totalPixels;

    // Estimate stroke count and length (simplified)
    const strokeCount = Math.max(1, Math.floor(strokePixels.length / 50));
    const averageStrokeLength = strokePixels.length / strokeCount;

    // Determine quality based on metrics
    let quality: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
    if (pixelRatio > 0.02 && averageStrokeLength > 20) {
      quality = 'excellent';
    } else if (pixelRatio > 0.01 && averageStrokeLength > 15) {
      quality = 'good';
    } else if (pixelRatio > 0.005 && averageStrokeLength > 10) {
      quality = 'fair';
    }

    return {
      isValid: pixelRatio > 0.001, // At least 0.1% of pixels should be signature
      quality,
      metrics: {
        pixelRatio,
        strokeCount,
        averageStrokeLength,
      }
    };
  }

  /**
   * Reset signature pad with proper calibration
   */
  resetSignaturePad(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset canvas properties for optimal touch response
    if (this.deviceInfo.isMobile) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
    }
  }

  /**
   * Get device info for debugging
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Update device info (call on resize/orientation change)
   */
  updateDeviceInfo(): void {
    this.deviceInfo = this.detectDevice();
  }
}

// Export singleton instance
export const signaturePadController = new SignaturePadController();

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  signature?: string | null;
}

export function SignaturePad({ onSignatureChange, signature }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onSignatureChange(null);
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL();
      onSignatureChange(signatureData);
      setIsEmpty(false);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-gray-300 rounded-lg bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              width: 400,
              height: 200,
              className: 'signature-canvas w-full'
            }}
            onEnd={handleEnd}
          />
        </div>
        {signature && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Signature:</p>
            <img src={signature} alt="Signature" className="border rounded max-h-24" />
          </div>
        )}
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={clear}
            size="sm"
          >
            Clear Signature
          </Button>
          <Button 
            type="button" 
            onClick={save}
            size="sm"
            disabled={isEmpty && !signature}
          >
            Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Button } from './ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type html2pdf from 'html2pdf.js';

interface ActionableResponseProps {
  htmlContent: string;
}

export function ActionableResponse({ htmlContent }: ActionableResponseProps) {
  const [h2p, setH2p] = useState<typeof html2pdf | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    import('html2pdf.js').then(module => {
      setH2p(() => module.default);
    });
  }, []);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframeDoc = iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [htmlContent]);


  const openInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadPdf = () => {
    if (!h2p) return;

    const opt = {
      margin: 1,
      filename: `report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    h2p().from(htmlContent).set(opt).save();
  };

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-[600px] border rounded-md bg-white"
        title="HTML Content"
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in New Tab
        </Button>
        <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!h2p}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

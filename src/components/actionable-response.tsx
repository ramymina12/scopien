"use client";

import { Button } from "./ui/button";
import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState, useRef } from "react";
// @ts-ignore - html2pdf.js doesn't have proper TypeScript definitions
import type html2pdf from "html2pdf.js";

interface ActionableResponseProps {
  htmlContent: string;
}

export function ActionableResponse({ htmlContent }: ActionableResponseProps) {
  const [h2p, setH2p] = useState<typeof html2pdf | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  console.log("🔍 ActionableResponse mounted");

  useEffect(() => {
    // @ts-ignore - html2pdf.js doesn't have proper TypeScript definitions
    import("html2pdf.js").then((module) => {
      setH2p(() => module.default);
    });
  }, []);

  useEffect(() => {
    if (htmlContent) {
      console.log("=== HTML Content Analysis ===");
      console.log("HTML Content Length:", htmlContent.length);
      console.log(
        "Contains ai.scopien.com:",
        htmlContent.includes("ai.scopien.com")
      );
      console.log(
        "Contains fetch/XHR:",
        htmlContent.includes("fetch(") || htmlContent.includes("XMLHttpRequest")
      );

      // Log first 500 characters to see the structure
      console.log("HTML Preview:", htmlContent.substring(0, 500));

      // Create blob URL for iframe src - this should work exactly like the "Open in New Tab" button
      console.log("🔄 Creating blob URL for iframe...");
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setIframeSrc(url);
      console.log("✅ Blob URL created for iframe:", url);

      // Clean up previous blob URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [htmlContent]);

  const openInNewTab = () => {
    console.log("🔗 Opening HTML content in new tab...");
    console.log("📄 Blob content length:", htmlContent.length);
    console.log("🌐 This will open WITHOUT request monitoring");

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    console.log("🔗 Blob URL created:", url);
    console.log("💡 Compare Network tab in new tab vs Console logs in iframe");

    window.open(url, "_blank");
  };

  const downloadPdf = () => {
    if (!h2p) return;

    const opt = {
      margin: 1,
      filename: `report-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    h2p().from(htmlContent).set(opt).save();
  };

  return (
    <div className="w-full">
      <iframe
        key={htmlContent.length} // Force re-render when content changes
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-[600px] border rounded-md bg-white"
        title="HTML Content"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
      />
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("📋 Full HTML Content:");
            console.log(htmlContent);
            navigator.clipboard.writeText(htmlContent).then(() => {
              console.log("✅ HTML content copied to clipboard");
            });
          }}
        >
          📋 Copy HTML
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("🔍 Comparing iframe vs original content:");
            console.log("📄 Original HTML length:", htmlContent.length);
            console.log("📄 Iframe src URL:", iframeSrc);
            console.log("📄 Iframe should now work exactly like blob URL!");
          }}
        >
          🔍 Compare Content
        </Button>
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in New Tab
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadPdf}
          disabled={!h2p}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

'use client';

import { marked } from 'marked';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // This check is to avoid running marked on the server, where it might not be available
    // or to prevent hydration mismatches if server/client rendering differs.
    if (typeof window !== 'undefined') {
        const parsed = marked.parse(content || '', { gfm: true, breaks: true });
        // It's good practice to sanitize, but for this app we trust the AI source.
        setHtmlContent(parsed as string);
    }
  }, [content]);

  // Use a key to force re-render when content changes to avoid stale content issues.
  return <div key={content} className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default MarkdownRenderer;

'use client';

import { marked } from 'marked';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const parsed = marked.parse(content || '', { gfm: true, breaks: true });
    // It's good practice to sanitize, but for this app we trust the AI source.
    setHtmlContent(parsed as string);
  }, [content]);

  // Use a key to force re-render when content changes to avoid stale content issues.
  return <div key={content} className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default MarkdownRenderer;

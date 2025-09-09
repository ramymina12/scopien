'use client';

import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse the markdown content to HTML. `marked` will process markdown and keep HTML tags intact.
  const htmlContent = marked.parse(content || '', { gfm: true, breaks: true });

  // Use a key to force re-render when content changes to avoid stale content issues.
  // The 'markdown-content' class will apply styling for both markdown and raw HTML elements.
  return <div key={content} className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent as string }} />;
};

export default MarkdownRenderer;

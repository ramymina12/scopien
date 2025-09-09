'use client';

import { useEffect, useState } from 'react';

interface HtmlRendererProps {
  content: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ content }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // To prevent hydration mismatch, we only render the content on the client.
  // The content is also used as a key to ensure the component re-renders when the content changes.
  return <div key={content} className="html-content" dangerouslySetInnerHTML={{ __html: content }} />;
};

export default HtmlRenderer;

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  source: string;
}

/**
 * Renders a Markdown string as rich content. We do NOT enable raw HTML
 * (no rehype-raw) on purpose — the input comes from our content/ folder,
 * but treating it as Markdown-only keeps the XSS surface small.
 *
 * Styling is applied via a single wrapper class so it stays scoped to
 * module bodies and we can swap to Tailwind's prose plugin later
 * without touching components.
 */
export const MarkdownContent = ({ source }: Props) => (
  <div className="markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {source}
    </ReactMarkdown>
  </div>
);

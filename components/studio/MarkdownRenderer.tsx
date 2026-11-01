'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null

  // Pre-process: if user pasted raw ASCII box characters outside a code block,
  // wrap contiguous ASCII box lines in a ```text block so it renders as a clean monospace box!
  const processedContent = normalizeAsciiBlocks(content)

  return (
    <div className={`prose-custom max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-black text-black mt-8 mb-4 tracking-tight leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-bold text-black mt-8 mb-3 tracking-tight border-b border-[#f4f4f5] pb-2 leading-snug">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base md:text-lg font-bold text-black mt-6 mb-2 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm md:text-base font-bold text-black mt-4 mb-2 tracking-tight">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm md:text-base text-[#27272a] leading-relaxed mb-4">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-black">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#27272a]">{children}</em>
          ),
          del: ({ children }) => (
            <del className="line-through text-[#71717a]">{children}</del>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1.5 text-sm md:text-base text-[#27272a]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-sm md:text-base text-[#27272a]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          input: (props) => {
            if (props.type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  className="mr-2 rounded accent-black inline-block align-middle"
                  disabled
                  {...props}
                />
              )
            }
            return <input {...props} />
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black pl-4 py-2.5 my-5 bg-[#fafafa] rounded-r-2xl italic text-[#52525b] text-sm md:text-base">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-[#e4e4e7] bg-white shadow-xs">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#f4f4f5] border-b border-[#e4e4e7] text-black">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#e4e4e7]">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-black border-r border-[#e4e4e7] last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-[#27272a] border-r border-[#e4e4e7] last:border-r-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#fafafa] transition-colors">
              {children}
            </tr>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && !String(children).includes('\n')
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-[#f4f4f5] text-rose-600 font-mono text-xs font-semibold">
                  {children}
                </code>
              )
            }
            return (
              <code className="font-mono text-xs text-neutral-100" {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-[#18181b] text-neutral-100 p-4 md:p-5 rounded-2xl overflow-x-auto font-mono text-xs leading-relaxed my-5 border border-neutral-800 shadow-sm">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <figure className="my-8 text-center">
              <img
                src={typeof src === 'string' ? src : ''}
                alt={alt || ''}
                className="rounded-2xl max-h-[600px] w-auto max-w-full mx-auto object-contain border border-[#e4e4e7] shadow-sm bg-neutral-50"
                loading="lazy"
              />
              {alt && (
                <figcaption className="text-center text-xs text-[#71717a] mt-2.5 font-medium italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>{children}</span>
            </a>
          ),
          hr: () => <hr className="my-8 border-[#e4e4e7]" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Automatically wraps contiguous lines containing ASCII art box borders (┌, └, ╔, ╚, etc.)
 * into a ```text block so it doesn't wrap or misalign if the user pastes raw ASCII art!
 */
function normalizeAsciiBlocks(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inAsciiBlock = false
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      result.push(line)
      continue
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    const hasBoxChar = /[┌┐└┘╔╗╚╝╠╣╦╩╬┼]/.test(line) || (line.match(/[│║]/g) || []).length >= 2

    if (hasBoxChar && !inAsciiBlock) {
      inAsciiBlock = true
      result.push('```text')
      result.push(line)
    } else if (!hasBoxChar && inAsciiBlock) {
      inAsciiBlock = false
      result.push('```')
      result.push(line)
    } else {
      result.push(line)
    }
  }

  if (inAsciiBlock) {
    result.push('```')
  }

  return result.join('\n')
}

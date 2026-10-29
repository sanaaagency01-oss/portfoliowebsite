/**
 * Resilient PDF Text Extractor
 * Extracts plain text and page structure from PDF buffers using unpdf (Mozilla pdfjs).
 * Handles compressed streams, font encodings (CMap), and Cyrillic/Latin text cleanly.
 */

import { extractText } from 'unpdf'

export interface ExtractedPdfContent {
  totalPages: number
  textByPage: { pageNumber: number; text: string }[]
  fullText: string
}

function sanitizeText(str: string): string {
  if (!str) return ''
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<ExtractedPdfContent> {
  try {
    const uint8Data = new Uint8Array(buffer)
    const result = await extractText(uint8Data)

    const rawPages = Array.isArray(result.text) ? result.text : [result.text]
    const totalPages = Math.max(1, result.totalPages || rawPages.length || 1)

    const textByPage: { pageNumber: number; text: string }[] = []
    const fullTextParts: string[] = []

    for (let i = 0; i < totalPages; i++) {
      const pageText = sanitizeText(rawPages[i] || '')
      textByPage.push({
        pageNumber: i + 1,
        text: pageText || `Хуудас ${i + 1}`,
      })
      if (pageText) {
        fullTextParts.push(`--- Хуудас ${i + 1} ---\n${pageText}`)
      }
    }

    const fullText = fullTextParts.join('\n\n')

    // If unpdf successfully extracted readable text, return it
    if (fullText.length > 50) {
      return {
        totalPages,
        textByPage,
        fullText,
      }
    }
  } catch (err) {
    console.warn('[unpdf extraction failed, using fallback stream parser]:', err)
  }

  // Fallback: Safe text block extractor without reading binary streams
  const binaryString = buffer.toString('binary')
  const pageMatches = binaryString.match(/\/Type\s*\/Page\b/g)
  let estimatedPages = pageMatches ? pageMatches.length : 1
  if (estimatedPages === 0) estimatedPages = 1

  const textChunks: string[] = []
  const btRegex = /BT[\s\S]*?ET/g
  let match: RegExpExecArray | null

  while ((match = btRegex.exec(binaryString)) !== null) {
    const block = match[0]
    const parenMatches = block.match(/\((?:[^()\\]|\\.)*\)/g)
    if (parenMatches) {
      const extractedWords = parenMatches.map((str) => {
        return str
          .slice(1, -1)
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\r/g, ' ')
          .replace(/\\n/g, ' ')
          .replace(/\\t/g, ' ')
      })
      const line = sanitizeText(extractedWords.join(' '))
      if (line.length > 0) {
        textChunks.push(line)
      }
    }
  }

  const fullText = textChunks.join('\n')
  const textByPage: { pageNumber: number; text: string }[] = []
  const chunksPerPage = Math.max(1, Math.ceil(textChunks.length / estimatedPages))

  for (let i = 0; i < estimatedPages; i++) {
    const pageNum = i + 1
    const start = i * chunksPerPage
    const end = start + chunksPerPage
    const pageSlice = textChunks.slice(start, end).join('\n')
    textByPage.push({
      pageNumber: pageNum,
      text: pageSlice || `Хуудас ${pageNum}`,
    })
  }

  return {
    totalPages: estimatedPages,
    textByPage,
    fullText: fullText || 'Баримт бичигт уншигдах вектор текст олдсонгүй.',
  }
}

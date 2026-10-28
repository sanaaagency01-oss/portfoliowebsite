/**
 * Resilient PDF Text Extractor
 * Extracts plain text and page estimates from PDF buffers without heavy binary C++ dependencies.
 */

export interface ExtractedPdfContent {
  totalPages: number
  textByPage: { pageNumber: number; text: string }[]
  fullText: string
}

export function extractTextFromPdfBuffer(buffer: Buffer): ExtractedPdfContent {
  const binaryString = buffer.toString('binary')
  
  // 1. Estimate total pages by counting /Type\s*\/Page\b (excluding /Pages)
  const pageMatches = binaryString.match(/\/Type\s*\/Page\b/g)
  let estimatedPages = pageMatches ? pageMatches.length : 1
  if (estimatedPages === 0) estimatedPages = 1

  // 2. Extract text chunks between BT and ET operators
  const textChunks: string[] = []
  const btRegex = /BT[\s\S]*?ET/g
  let match: RegExpExecArray | null

  while ((match = btRegex.exec(binaryString)) !== null) {
    const block = match[0]
    // Look for parenthesized strings (e.g. (Hello World) Tj or [(Hello) 10 (World)] TJ)
    const parenMatches = block.match(/\((?:[^()\\]|\\.)*\)/g)
    if (parenMatches) {
      const extractedWords = parenMatches.map((str) => {
        // remove outer parens and clean escape sequences
        return str
          .slice(1, -1)
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\r/g, ' ')
          .replace(/\\n/g, ' ')
          .replace(/\\t/g, ' ')
      })
      const line = extractedWords.join(' ').trim()
      if (line.length > 0) {
        textChunks.push(line)
      }
    }
  }

  // Fallback: If BT...ET extraction is sparse (e.g., compressed streams), search for readable text strings
  if (textChunks.length < 5) {
    const rawMatches = binaryString.match(/[A-Za-z0-9\u0400-\u04FF\s.,:;!?/#%()'"-]{4,}/g)
    if (rawMatches) {
      for (const m of rawMatches.slice(0, 1500)) {
        const trimmed = m.trim()
        if (
          trimmed.length > 5 &&
          !trimmed.startsWith('/Type') &&
          !trimmed.startsWith('/Filter') &&
          !trimmed.startsWith('endobj')
        ) {
          textChunks.push(trimmed)
        }
      }
    }
  }

  const fullText = textChunks.join('\n')
  
  // Divide text chunks across estimated pages
  const textByPage: { pageNumber: number; text: string }[] = []
  const chunksPerPage = Math.max(1, Math.ceil(textChunks.length / estimatedPages))

  for (let i = 0; i < estimatedPages; i++) {
    const pageNum = i + 1
    const start = i * chunksPerPage
    const end = start + chunksPerPage
    const pageSlice = textChunks.slice(start, end).join('\n')
    textByPage.push({
      pageNumber: pageNum,
      text: pageSlice || `Хуудас ${pageNum} мэдээлэл`,
    })
  }

  return {
    totalPages: estimatedPages,
    textByPage,
    fullText,
  }
}

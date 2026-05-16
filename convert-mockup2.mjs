import sharp from "sharp"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const src = path.join(__dirname, "public/projects/Zen tarot candle label/mockup2.png")
const dst = path.join(__dirname, "public/projects/Zen tarot candle label/mockup2.webp")

await sharp(src).webp({ quality: 90 }).toFile(dst)
console.log("✓ mockup2.webp created successfully")

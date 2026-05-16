"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface FadeUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
}

export default function FadeUp({
  children,
  className,
  delay = 0,
  duration = 0.7,
  distance = 32,
}: FadeUpProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

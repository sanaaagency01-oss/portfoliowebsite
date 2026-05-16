"use client"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import { useAnimationFrame } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
  children: ReactNode
  className?: string
  sensitivity?: number
  easingFactor?: number
}

// ── Gyroscope hook (mobile only) ─────────────────────────────────────────────
function useGyroPositionRef(containerRef: React.RefObject<HTMLDivElement | null>) {
  const gyroRef = useRef({ x: 0, y: 0, active: false })
  const baseRef = useRef<{ beta: number; gamma: number } | null>(null)

  useEffect(() => {
    // Only activate on touch devices
    const isTouchDevice =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches

    if (!isTouchDevice) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta  = e.beta  ?? 0   // front-back tilt
      const gamma = e.gamma ?? 0   // left-right tilt

      // Calibrate: use first reading as neutral
      if (!baseRef.current) {
        baseRef.current = { beta, gamma }
      }

      const db = beta  - baseRef.current.beta    // deviation Y
      const dg = gamma - baseRef.current.gamma   // deviation X

      const container = containerRef.current
      if (!container) return
      const { width, height } = container.getBoundingClientRect()

      // Map ±30° tilt → full container width/height
      const clamp = (v: number, min: number, max: number) =>
        Math.min(Math.max(v, min), max)

      gyroRef.current = {
        x: (clamp(dg, -30, 30) / 30) * (width  / 2) + width  / 2,
        y: (clamp(db, -30, 30) / 30) * (height / 2) + height / 2,
        active: true,
      }
    }

    // iOS 13+ requires permission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(DeviceOrientationEvent as any)
        .requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true)
            gyroRef.current.active = true
          }
        })
        .catch(() => {/* permission denied — fall back to mouse */})
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true)
      gyroRef.current.active = true
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true)
    }
  }, [containerRef])

  return gyroRef
}

// ── Main Floating component ───────────────────────────────────────────────────
const Floating = ({
  children,
  className,
  sensitivity = 1,
  easingFactor = 0.05,
  ...props
}: FloatingProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement
        depth: number
        currentPosition: { x: number; y: number }
      }
    >()
  )

  const mousePositionRef = useMousePositionRef(containerRef)
  const gyroPositionRef  = useGyroPositionRef(containerRef)

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      })
    },
    []
  )

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  useAnimationFrame(() => {
    if (!containerRef.current) return

    // Use gyro if active (mobile), otherwise mouse
    const pos = gyroPositionRef.current.active
      ? gyroPositionRef.current
      : mousePositionRef.current

    elementsMap.current.forEach((data) => {
      const strength   = (data.depth * sensitivity) / 20
      const newTargetX = pos.x * strength
      const newTargetY = pos.y * strength
      const dx = newTargetX - data.currentPosition.x
      const dy = newTargetY - data.currentPosition.y
      data.currentPosition.x += dx * easingFactor
      data.currentPosition.y += dy * easingFactor
      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={containerRef}
        className={cn("absolute top-0 left-0 w-full h-full", className)}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

interface FloatingElementProps {
  children: ReactNode
  className?: string
  depth?: number
}

export const FloatingElement = ({
  children,
  className,
  depth = 1,
}: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(FloatingContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    const nonNullDepth = depth ?? 0.01
    context.registerElement(idRef.current, elementRef.current, nonNullDepth)
    return () => context.unregisterElement(idRef.current)
  }, [depth, context])

  return (
    <div
      ref={elementRef}
      className={cn("absolute will-change-transform", className)}
    >
      {children}
    </div>
  )
}

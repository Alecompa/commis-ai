"use client"

import type React from "react"

import { useEffect, useState } from "react"

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Return nothing on the server and during first client render
  }

  return <>{children}</>
}

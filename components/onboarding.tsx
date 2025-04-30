"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChefHat, Clipboard, Utensils, Lightbulb, ArrowRight } from "lucide-react"

// Constants
const ONBOARDING_SEEN_KEY = "onboardingCompleted"

// Helper functions to manage onboarding state
export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(ONBOARDING_SEEN_KEY) === "true"
}

export function markOnboardingAsSeen(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ONBOARDING_SEEN_KEY, "true")
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ONBOARDING_SEEN_KEY)
}

interface OnboardingStep {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

const steps: OnboardingStep[] = [
  {
    icon: ChefHat,
    title: "Welcome to Commis",
    description: "Your personal AI-powered kitchen companion for recipe inspiration",
    color: "bg-autumn-500",
  },
  {
    icon: Clipboard,
    title: "Add Ingredients",
    description: "Enter ingredients you have available and check the ones you want to use",
    color: "bg-blue-500",
  },
  {
    icon: Utensils,
    title: "Set Preferences",
    description: "Choose effort level, flexibility, and add specific requests",
    color: "bg-green-500",
  },
  {
    icon: Lightbulb,
    title: "Generate Recipes",
    description: "Click 'Generate Recipe' to create a personalized recipe based on your ingredients",
    color: "bg-amber-500",
  },
]

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsExiting(true)
      setTimeout(() => {
        markOnboardingAsSeen()
        onComplete()
      }, 500)
    }
  }

  const skipOnboarding = () => {
    setIsExiting(true)
    setTimeout(() => {
      markOnboardingAsSeen()
      onComplete()
    }, 500)
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md p-6 mx-auto bg-card rounded-xl shadow-lg"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="sm" onClick={skipOnboarding}>
                Skip
              </Button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full ${steps[currentStep].color} mb-6`}>
                {steps[currentStep].icon && (
                  <div className="w-8 h-8 text-white">
                    {React.createElement(steps[currentStep].icon, { className: "w-8 h-8" })}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>

              <div className="flex items-center justify-between w-full">
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? steps[currentStep].color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <Button onClick={nextStep} className={steps[currentStep].color}>
                  {currentStep < steps.length - 1 ? (
                    "Next"
                  ) : (
                    "Get Started"
                  )}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

"use client"

import type React from "react"
import { useCallback, memo, useState } from "react"
import type { AIProviderType } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ChevronDown, ImageIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"

interface AIProviderProps {
  provider: AIProviderType
  onProviderChange: (provider: AIProviderType) => void
  preferences: {
    prompt: string
    effortLevel: string
    flexibility: string
    generateImage: boolean
  }
  onPreferencesChange: (preferences: any) => void
  onGenerate: () => void
  isGenerating: boolean
}

// Use memo to prevent unnecessary re-renders
export const AIProvider = memo(function AIProvider({
  provider,
  onProviderChange,
  preferences,
  onPreferencesChange,
  onGenerate,
  isGenerating,
}: AIProviderProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onPreferencesChange({
        ...preferences,
        prompt: e.target.value,
      })
    },
    [preferences, onPreferencesChange],
  )

  const handleEffortChange = useCallback(
    (value: string) => {
      onPreferencesChange({
        ...preferences,
        effortLevel: value,
      })
    },
    [preferences, onPreferencesChange],
  )

  const handleFlexibilityChange = useCallback(
    (value: string) => {
      onPreferencesChange({
        ...preferences,
        flexibility: value,
      })
    },
    [preferences, onPreferencesChange],
  )

  const handleProviderChange = useCallback(
    (value: string) => {
      onProviderChange(value as AIProviderType)
    },
    [onProviderChange],
  )

  const handleImageGenerationChange = useCallback(
    (checked: boolean) => {
      onPreferencesChange({
        ...preferences,
        generateImage: checked,
      })
    },
    [preferences, onPreferencesChange],
  )

  return (
    <Card className="bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recipe Preferences</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>

          <CardContent className="space-y-4 pt-0 pb-2">
            {/*
            <div className="space-y-2">
              <Label htmlFor="ai-provider">AI Provider</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger id="ai-provider" className="bg-background">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="local">Local LLM</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div> 
            */}

            <div className="space-y-2">
              <Label htmlFor="prompt-input">Specific Requests</Label>
              <Textarea
                id="prompt-input"
                placeholder="Any specific requests? (e.g., 'quick breakfast', 'italian pasta dish', 'vegetarian', 'use up the chicken')"
                value={preferences.prompt}
                onChange={handlePromptChange}
                className="min-h-[80px] bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Effort Level</Label>
              <RadioGroup
                value={preferences.effortLevel}
                onValueChange={handleEffortChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="effort-low" />
                  <Label htmlFor="effort-low" className="cursor-pointer">
                    Low
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="effort-medium" />
                  <Label htmlFor="effort-medium" className="cursor-pointer">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="effort-high" />
                  <Label htmlFor="effort-high" className="cursor-pointer">
                    High
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Ingredient Flexibility</Label>
              <RadioGroup
                value={preferences.flexibility}
                onValueChange={handleFlexibilityChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strict" id="flexibility-strict" />
                  <Label htmlFor="flexibility-strict" className="cursor-pointer">
                    Use only selected ingredients
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="allow-groceries" id="flexibility-groceries" />
                  <Label htmlFor="flexibility-groceries" className="cursor-pointer">
                    Can suggest adding 1-2 simple grocery items
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
              id="generate-image"
              checked={preferences.generateImage}
              onCheckedChange={handleImageGenerationChange}
              />
              <Label htmlFor="generate-image" className="cursor-pointer flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-autumn-500" />
              Generate recipe image
              </Label>
            </div>
            </CardContent>
          </CollapsibleContent>

          <CardContent className="pt-4"> {/* Increased padding-top to enlarge the gap */}
            <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
              </>
            ) : (
              "Generate Recipe"
            )}
            </Button>
          </CardContent>
      </Collapsible>
    </Card>
  )
})

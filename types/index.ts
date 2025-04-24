export interface Ingredient {
  id: number
  text: string
  selected: boolean
}

export interface Recipe {
  id: number
  title: string
  description: string
  estimatedTime: string
  ingredients: string[]
  procedure: string
  image?: string // Base64 encoded image data
}

export type AIProviderType = "openai" | "anthropic" | "local" | "groq"

export interface RecipeGenerationParams {
  selectedIngredients: string[]
  allIngredients: string[]
  preferences: {
    prompt: string
    effortLevel: string
    flexibility: string
    generateImage: boolean // New flag to control image generation
  }
  aiProvider: AIProviderType
}

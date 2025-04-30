"use client"

import { useState, useCallback, useEffect } from "react"
import { Onboarding, hasSeenOnboarding } from "@/components/onboarding"
import { IngredientPanel } from "@/components/ingredient-panel"
import { RecipePanel } from "@/components/recipe-panel"
import { AIProvider } from "@/components/ai-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Ingredient, Recipe, AIProviderType } from "@/types"
import { generateRecipe } from "@/lib/recipe-generator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  loadSidebarState,
  saveSidebarState,
  loadIngredients,
  saveIngredients,
  loadRecipes,
  saveRecipes,
  deleteRecipe as deleteRecipeFromStorage,
} from "@/lib/storage"

export default function KitchenApp() {
  // Initialize state from storage only once on component mount
  const [initialSidebarState, setInitialSidebarState] = useState<boolean | null>(null)
  const [initialIngredients, setInitialIngredients] = useState<Ingredient[] | null>(null)
  const [initialRecipes, setInitialRecipes] = useState<Recipe[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial values from storage
  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialSidebarState(loadSidebarState())
        setInitialIngredients(loadIngredients())

        const recipes = await loadRecipes()
        setInitialRecipes(recipes)
      } catch (error) {
        console.error("Error loading from storage:", error)
        setInitialSidebarState(false)
        setInitialIngredients([])
        setInitialRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Wait for initial values to be loaded before rendering the main content
  if (isLoading || initialSidebarState === null || initialIngredients === null || initialRecipes === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-autumn-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading Kitchen AI Assistant...</p>
        </div>
      </div>
    )
  }

  // Now use the loaded initial values
  return (
    <KitchenAppContent
      initialSidebarState={initialSidebarState}
      initialIngredients={initialIngredients}
      initialRecipes={initialRecipes}
    />
  )
}

// Separate component to avoid re-rendering issues
function KitchenAppContent({
  initialSidebarState,
  initialIngredients,
  initialRecipes,
}: {
  initialSidebarState: boolean
  initialIngredients: Ingredient[]
  initialRecipes: Recipe[]
}) {
  // State for onboarding
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding())
  
  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialSidebarState)

  // State for ingredients and recipes
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)

  // State for recipe generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [preferences, setPreferences] = useState({
    prompt: "",
    effortLevel: "low",
    flexibility: "strict",
    generateImage: true, // Default to generating images
  })

  // State for AI provider
  const [aiProvider, setAIProvider] = useState<AIProviderType>("openai")

  // Save to storage when state changes
  useEffect(() => {
    try {
      saveSidebarState(isSidebarCollapsed)
    } catch (error) {
      console.error("Error saving sidebar state:", error)
    }
  }, [isSidebarCollapsed])

  useEffect(() => {
    try {
      saveIngredients(ingredients)
    } catch (error) {
      console.error("Error saving ingredients:", error)
    }
  }, [ingredients])

  useEffect(() => {
    async function persistRecipes() {
      try {
        await saveRecipes(recipes)
      } catch (error) {
        console.error("Error saving recipes:", error)
      }
    }

    persistRecipes()
  }, [recipes])

  // Toggle sidebar collapsed state
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  // Function to add a new ingredient
  const addIngredient = useCallback((text: string) => {
    const trimmedText = text.trim()
    if (!trimmedText) return

    // Check if ingredient already exists
    setIngredients((prevIngredients) => {
      if (prevIngredients.some((ing) => ing.text.toLowerCase() === trimmedText.toLowerCase())) {
        return prevIngredients
      }
      return [...prevIngredients, { id: Date.now(), text: trimmedText, selected: false }]
    })
  }, [])

  // Function to remove an ingredient
  const removeIngredient = useCallback((id: number) => {
    setIngredients((prevIngredients) => prevIngredients.filter((ing) => ing.id !== id))
  }, [])

  // Function to toggle ingredient selection
  const toggleIngredient = useCallback((id: number) => {
    setIngredients((prevIngredients) =>
      prevIngredients.map((ing) => (ing.id === id ? { ...ing, selected: !ing.selected } : ing)),
    )
  }, [])

  // Function to toggle all ingredients
  const toggleAllIngredients = useCallback(() => {
    setIngredients((prevIngredients) => {
      if (prevIngredients.length === 0) return prevIngredients

      const selectedCount = prevIngredients.filter((ing) => ing.selected).length
      const shouldSelectAll = selectedCount < prevIngredients.length / 2

      return prevIngredients.map((ing) => ({ ...ing, selected: shouldSelectAll }))
    })
  }, [])

  // Function to update preferences
  const updatePreferences = useCallback((newPreferences: typeof preferences) => {
    setPreferences(newPreferences)
  }, [])

  // Function to update AI provider
  const updateAIProvider = useCallback((provider: AIProviderType) => {
    setAIProvider(provider)
  }, [])

  // Function to generate a recipe
  const handleGenerateRecipe = useCallback(async () => {
    setIsGenerating(true)

    try {
      const selectedIngredients = ingredients.filter((ing) => ing.selected).map((ing) => ing.text)
      const allIngredients = ingredients.map((ing) => ing.text)

      const newRecipe = await generateRecipe({
        selectedIngredients,
        allIngredients,
        preferences,
        aiProvider,
      })

      console.log("New recipe generated:", newRecipe.title)
      console.log("Recipe has image:", !!newRecipe.image)

      // Add the new recipe to the beginning of the list
      setRecipes((prevRecipes) => {
        const updatedRecipes = [newRecipe, ...prevRecipes]
        console.log("Updated recipes count:", updatedRecipes.length)
        return updatedRecipes
      })
    } catch (error) {
      console.error("Error generating recipe:", error)
      alert("Failed to generate recipe. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [ingredients, preferences, aiProvider])

  // Function to delete a recipe
  const deleteRecipe = useCallback(
    async (id: number) => {
      try {
        const updatedRecipes = await deleteRecipeFromStorage(id, recipes)
        setRecipes(updatedRecipes)
      } catch (error) {
        console.error("Error deleting recipe:", error)
      }
    },
    [recipes],
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - fixed position */}
        <aside
          className={cn(
            "relative flex flex-col border-r border-border bg-background transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-[60px] min-w-[60px]" : "w-full md:w-[400px] md:min-w-[400px]",
          )}
        >
          {/* Collapse toggle button (visible on larger screens) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute right-0 z-10 hidden -mr-3 translate-x-1/2 border border-border rounded-full top-20 bg-background/90 md:flex"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {/* Sidebar content - scrollable */}
          <div
            className={cn("flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]", isSidebarCollapsed ? "hidden" : "block")}
          >
            <IngredientPanel
              ingredients={ingredients}
              onAdd={addIngredient}
              onRemove={removeIngredient}
              onToggle={toggleIngredient}
              onToggleAll={toggleAllIngredients}
            />

            <div className="mt-6">
              <AIProvider
                provider={aiProvider}
                onProviderChange={updateAIProvider}
                preferences={preferences}
                onPreferencesChange={updatePreferences}
                onGenerate={handleGenerateRecipe}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Collapsed sidebar content */}
          {isSidebarCollapsed && (
            <div className="flex flex-col items-center justify-start p-2 space-y-4">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-10 h-10" title="Expand sidebar">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </aside>

        {/* Main content - independently scrollable */}
        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-8rem)] overflow-y-auto p-6">
            <RecipePanel recipes={recipes} onDelete={deleteRecipe} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

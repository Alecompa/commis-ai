// Storage utility functions for the Kitchen AI Assistant
import type { Recipe, Ingredient } from "@/types"

// Constants
const RECIPES_KEY = "kitchenAppRecipes_v1"
const INGREDIENTS_KEY = "kitchenAppIngredients_v2"
const SIDEBAR_KEY = "sidebarCollapsed"
const DB_NAME = "KitchenAIAssistant"
const DB_VERSION = 1
const IMAGES_STORE = "recipeImages"

// IndexedDB setup
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE, { keyPath: "id" })
      }
    }
  })
}

// Save image to IndexedDB
export async function saveImageToIndexedDB(id: number, imageData: string): Promise<void> {
  try {
    const db = await openDatabase()
    const transaction = db.transaction([IMAGES_STORE], "readwrite")
    const store = transaction.objectStore(IMAGES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.put({ id, imageData })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Error saving image to IndexedDB:", error)
    throw error
  }
}

// Get image from IndexedDB
export async function getImageFromIndexedDB(id: number): Promise<string | null> {
  try {
    const db = await openDatabase()
    const transaction = db.transaction([IMAGES_STORE], "readonly")
    const store = transaction.objectStore(IMAGES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.imageData)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Error getting image from IndexedDB:", error)
    return null
  }
}

// Delete image from IndexedDB
export async function deleteImageFromIndexedDB(id: number): Promise<void> {
  try {
    const db = await openDatabase()
    const transaction = db.transaction([IMAGES_STORE], "readwrite")
    const store = transaction.objectStore(IMAGES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Error deleting image from IndexedDB:", error)
  }
}

// Save recipes to localStorage (without images)
export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  try {
    // Create a deep copy of recipes to avoid modifying the original objects
    const recipesToSave = JSON.parse(JSON.stringify(recipes))

    // First, save all images to IndexedDB
    for (const recipe of recipes) {
      if (recipe.image) {
        console.log(`Saving image for recipe ${recipe.id} to IndexedDB`)
        await saveImageToIndexedDB(recipe.id, recipe.image)
      }
    }

    // Then save recipes without images to localStorage
    for (const recipe of recipesToSave) {
      if (recipe.image) {
        delete recipe.image
      }
    }

    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipesToSave))
    console.log("Recipes saved to localStorage (without images)")
  } catch (error) {
    console.error("Error saving recipes:", error)
    throw error
  }
}

// Load recipes from localStorage and add images from IndexedDB
export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const recipesJson = localStorage.getItem(RECIPES_KEY)
    if (!recipesJson) return []

    const recipes: Recipe[] = JSON.parse(recipesJson)
    console.log("Loaded recipes from localStorage:", recipes)

    // Load images for each recipe
    for (const recipe of recipes) {
      try {
        const imageData = await getImageFromIndexedDB(recipe.id)
        if (imageData) {
          recipe.image = imageData
          console.log(`Image loaded for recipe ${recipe.id}`)
        } else {
          console.log(`No image found in IndexedDB for recipe ${recipe.id}`)
        }
      } catch (err) {
        console.error(`Error loading image for recipe ${recipe.id}:`, err)
      }
    }

    console.log("Recipes with images:", recipes)
    return recipes
  } catch (error) {
    console.error("Error loading recipes:", error)
    return []
  }
}

// Save ingredients to localStorage
export function saveIngredients(ingredients: Ingredient[]): void {
  try {
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients))
  } catch (error) {
    console.error("Error saving ingredients:", error)
    throw error
  }
}

// Load ingredients from localStorage
export function loadIngredients(): Ingredient[] {
  try {
    const ingredientsJson = localStorage.getItem(INGREDIENTS_KEY)
    return ingredientsJson ? JSON.parse(ingredientsJson) : []
  } catch (error) {
    console.error("Error loading ingredients:", error)
    return []
  }
}

// Save sidebar state to localStorage
export function saveSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(collapsed))
  } catch (error) {
    console.error("Error saving sidebar state:", error)
    // Non-critical, can be ignored
  }
}

// Load sidebar state from localStorage
export function loadSidebarState(): boolean {
  try {
    const stateJson = localStorage.getItem(SIDEBAR_KEY)
    return stateJson ? JSON.parse(stateJson) : false
  } catch (error) {
    console.error("Error loading sidebar state:", error)
    return false
  }
}

// Delete a recipe and its image
export async function deleteRecipe(id: number, recipes: Recipe[]): Promise<Recipe[]> {
  try {
    // Delete image from IndexedDB
    await deleteImageFromIndexedDB(id)

    // Filter out the recipe from the array
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id)

    // Save the updated recipes list
    await saveRecipes(updatedRecipes)

    return updatedRecipes
  } catch (error) {
    console.error("Error deleting recipe:", error)
    throw error
  }
}

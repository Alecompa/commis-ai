"use client"

import type React from "react"
import { useState, useCallback, memo, useEffect } from "react"
import type { Recipe } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Clock, Trash2, ChevronDown, ChevronUp, Download, ImageIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface RecipePanelProps {
  recipes: Recipe[]
  onDelete: (id: number) => void
}

// Use memo to prevent unnecessary re-renders
export const RecipePanel = memo(function RecipePanel({ recipes, onDelete }: RecipePanelProps) {
  // Track expanded state for each recipe
  const [expandedRecipes, setExpandedRecipes] = useState<Record<number, boolean>>({})
  // Track loading state for images
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({})

  // Initialize loading state for all recipes
  useEffect(() => {
    const newLoadingState: Record<number, boolean> = {}
    recipes.forEach((recipe) => {
      if (recipe.id && recipe.image && loadingImages[recipe.id] === undefined) {
        newLoadingState[recipe.id] = true
      }
    })

    if (Object.keys(newLoadingState).length > 0) {
      setLoadingImages((prev) => ({ ...prev, ...newLoadingState }))
    }
  }, [recipes, loadingImages])

  const toggleExpand = useCallback((id: number) => {
    setExpandedRecipes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleDelete = useCallback(
    (id: number, e?: React.MouseEvent) => {
      // Stop event propagation if event is provided
      if (e) {
        e.stopPropagation()
      }
      // Call the onDelete prop with the recipe id
      onDelete(id)
    },
    [onDelete],
  )

  const downloadImage = useCallback((recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Download image clicked for recipe:", recipe.id)
    console.log("Image data available:", !!recipe.image)

    if (!recipe.image) {
      console.error("No image data available for download")
      alert("No image data available for download")
      return
    }

    try {
      // Create a temporary link element
      const link = document.createElement("a")
      link.href = recipe.image
      link.download = `${recipe.title.replace(/\s+/g, "-").toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log("Image download initiated")
    } catch (error) {
      console.error("Error downloading image:", error)
      alert("Failed to download image. Please try again.")
    }
  }, [])

  const handleImageLoad = useCallback((id: number) => {
    setLoadingImages((prev) => ({
      ...prev,
      [id]: false,
    }))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">My Saved Recipes</h2>

      {recipes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>No recipes generated yet. Click "Generate Recipe" to get started!</p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden bg-card border-border">
              {recipe.image ? (
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  {loadingImages[recipe.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="w-10 h-10 border-4 border-autumn-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(recipe.id)}
                    onError={(e) => {
                      console.error(`Error loading image for recipe ${recipe.id}`)
                      setLoadingImages((prev) => ({ ...prev, [recipe.id]: false }))
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImage(recipe, e)
                    }}
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}

              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={(e) => {
                  // Only toggle if the click was directly on the header, not on a button
                  if (e.currentTarget === e.target || (e.target as HTMLElement).closest(".card-title-area")) {
                    toggleExpand(recipe.id)
                  }
                }}
              >
                <div className="flex justify-between items-start card-title-area">
                  <CardTitle className="text-autumn-500">{recipe.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{recipe.estimatedTime}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <CardDescription className="pb-2 border-b border-dashed border-border">
                  {recipe.description}
                </CardDescription>

                {expandedRecipes[recipe.id] && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Ingredients:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="text-sm">
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Procedure:</h4>
                      <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground">
                        <ReactMarkdown>{recipe.procedure}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t border-border flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => toggleExpand(recipe.id)}>
                  {expandedRecipes[recipe.id] ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation() // Stop event from reaching the card header
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the recipe "{recipe.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault() // Prevent default action
                          handleDelete(recipe.id)
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
})

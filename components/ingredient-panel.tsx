"use client"

import type React from "react"
import { useState, useCallback, memo } from "react"
import type { Ingredient } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface IngredientPanelProps {
  ingredients: Ingredient[]
  onAdd: (text: string) => void
  onRemove: (id: number) => void
  onToggle: (id: number) => void
  onToggleAll: () => void
}

// Use memo to prevent unnecessary re-renders
export const IngredientPanel = memo(function IngredientPanel({
  ingredients,
  onAdd,
  onRemove,
  onToggle,
  onToggleAll,
}: IngredientPanelProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (inputValue.trim()) {
        onAdd(inputValue)
        setInputValue("")
      }
    },
    [inputValue, onAdd],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">My Ingredients</h2>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add ingredient (e.g., eggs)"
          className="flex-1 bg-background"
        />
        <Button type="submit">Add</Button>
      </form>

      {ingredients.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onToggleAll} className="text-xs">
            Select/Deselect All
          </Button>
        </div>
      )}

      <div className="border rounded-md p-3 bg-card min-h-[200px] max-h-[250px] overflow-y-auto">
        {ingredients.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No ingredients added yet.</p>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center justify-between py-1 border-b border-dashed border-border last:border-0"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={`ing-${ingredient.id}`}
                    checked={ingredient.selected}
                    onCheckedChange={() => onToggle(ingredient.id)}
                  />
                  <label htmlFor={`ing-${ingredient.id}`} className="text-sm cursor-pointer flex-1">
                    {ingredient.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(ingredient.id)}
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Checked ingredients are persistent and used for generation.</p>
    </div>
  )
})

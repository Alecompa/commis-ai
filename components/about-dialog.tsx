"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { InfoIcon, ChefHat, Utensils, Clipboard, Lightbulb, Leaf } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="About">
          <InfoIcon className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ChefHat className="h-6 w-6 text-autumn-500" />
            About Commis
          </DialogTitle>
          <DialogDescription>Your personal AI-powered kitchen companion for recipe inspiration</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            Commis helps you create delicious recipes based on ingredients you already have. Simply add
            your available ingredients, select your preferences, and let AI do the rest!
          </p>

          <h3 className="text-lg font-medium">How to Use</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FeatureCard
              icon={Clipboard}
              title="Add Ingredients"
              description="Enter ingredients you have available and check the ones you want to use."
            />

            <FeatureCard
              icon={Utensils}
              title="Set Preferences"
              description="Choose effort level, flexibility, and add specific requests."
            />

            <FeatureCard
              icon={Lightbulb}
              title="Generate Recipes"
              description="Click 'Generate Recipe' to create a personalized recipe."
            />

            <FeatureCard
              icon={Leaf}
              title="Save Favorites"
              description="Your recipes are automatically saved for future reference."
            />
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Commis is designed to inspire your cooking adventures. The quality of recipes depends on the
            AI provider and the specificity of your inputs. For best results, be clear about your preferences and
            desired cuisine type.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 py-3">
        <Icon className="h-5 w-5 text-autumn-500" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

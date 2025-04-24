import type { RecipeGenerationParams, Recipe } from "@/types"
import { generateRecipeImage } from "@/lib/image-generator"

// This function will handle recipe generation based on the selected AI provider
export async function generateRecipe(params: RecipeGenerationParams): Promise<Recipe> {
  const { selectedIngredients, allIngredients, preferences, aiProvider } = params

  // Construct the prompt for the AI
  const systemPrompt = `You are a helpful kitchen assistant. Generate EXACTLY ONE recipe suggestion based primarily on the ingredients provided.
You MUST output ONLY a single valid JSON object matching this structure:
{
  "title": "Recipe Title",
  "description": "Brief description of the dish.",
  "estimatedTime": "e.g., Approx. 30 minutes",
  "ingredients": ["Ingredient 1 (quantity)", "Ingredient 2 (quantity)", "..."],
  "procedure": "Step-by-step instructions. Use Markdown for formatting like lists or bold text if desired within this string."
}
Do NOT include any text before or after the JSON object.`

  const userPrompt = `Generate one recipe based on these details:

Available Ingredients:
${allIngredients.length > 0 ? `- ${allIngredients.join("\n- ")}` : "(None specified)"}

Specifically Selected Ingredients to Use (Prioritize these):
${selectedIngredients.length > 0 ? `- ${selectedIngredients.join("\n- ")}` : "(Consider all available)"}

User Preferences & Directions:
${preferences.prompt || "(No specific preference provided)"}

Desired Effort Level: ${preferences.effortLevel}
Constraint: ${preferences.flexibility === "strict" ? "Strictly use only available ingredients." : "Can suggest 1-2 simple grocery items if needed."}

Remember to output ONLY the JSON object.`

  try {
    // Different API calls based on the selected provider
    let result

    // For client-side usage, we'll use a mock generator for now
    // In a production app, you would implement proper API calls with environment variables
    if (typeof window !== "undefined") {
      // We're on the client side
      switch (aiProvider) {
        case "openai":
          // In a real app, you would call the OpenAI API here
          // For now, use the mock generator
          result = await callOpenAI(systemPrompt, userPrompt)
          break
        case "anthropic":
          result = await mockRecipeGenerator(userPrompt)
          break
        case "groq":
          result = await mockRecipeGenerator(userPrompt)
          break
        case "local":
          try {
            result = await callLocalLLM(systemPrompt, userPrompt)
          } catch (error) {
            console.error("Local LLM error, falling back to mock:", error)
            result = await mockRecipeGenerator(userPrompt)
          }
          break
        default:
          result = await mockRecipeGenerator(userPrompt)
      }
    } else {
      // We're on the server side
      result = await mockRecipeGenerator(userPrompt)
    }

    // Parse the result and add an ID
    const recipe = {
      ...result,
      id: Date.now(),
    }

    // Generate an image if requested
    if (preferences.generateImage) {
      try {
        console.log("Generating image for recipe:", recipe.title)
        const imageData = await generateRecipeImage({
          title: recipe.title,
          description: recipe.description,
        })

        if (imageData) {
          recipe.image = imageData
          console.log("Image generated successfully")
        } else {
          console.log("No image data returned from generator")
        }
      } catch (error) {
        console.error("Error generating image:", error)
        // Continue without an image if generation fails
      }
    }

    console.log("Generated recipe with image:", !!recipe.image)
    return recipe
  } catch (error) {
    console.error("Error generating recipe:", error)
    throw error
  }
}

// Implementation for OpenAI
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<Omit<Recipe, "id">> {
  // Check if API key is available
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured")
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI API error:", error)
    throw error
  }
}

// Implementation for Local LLM (similar to original script.js)
async function callLocalLLM(systemPrompt: string, userPrompt: string): Promise<Omit<Recipe, "id">> {
  try {
    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Local LLM API error: ${errorText}`)
    }

    const result = await response.json()
    const jsonString = result.choices?.[0]?.message?.content

    if (!jsonString) {
      throw new Error("LLM did not return the expected content structure")
    }

    return JSON.parse(jsonString)
  } catch (error) {
    console.error("Local LLM API error:", error)
    throw error
  }
}

// Mock recipe generator for testing
function mockRecipeGenerator(userPrompt: string): Promise<Omit<Recipe, "id">> {
  return new Promise((resolve) => {
    // Extract some keywords from the prompt for a more relevant mock
    const keywords = userPrompt.toLowerCase()
    let recipeType = "pasta"

    if (keywords.includes("breakfast")) recipeType = "breakfast"
    else if (keywords.includes("dessert")) recipeType = "dessert"
    else if (keywords.includes("soup")) recipeType = "soup"
    else if (keywords.includes("salad")) recipeType = "salad"

    const mockRecipes = {
      pasta: {
        title: "Simple Garlic Pasta",
        description: "A quick and easy pasta dish with garlic and olive oil.",
        estimatedTime: "20 minutes",
        ingredients: [
          "8 oz pasta",
          "4 cloves garlic, minced",
          "1/4 cup olive oil",
          "1/4 cup grated Parmesan cheese",
          "Red pepper flakes (optional)",
          "Salt and pepper to taste",
        ],
        procedure:
          "1. Cook pasta according to package instructions.\n2. While pasta cooks, heat olive oil in a pan over medium heat.\n3. Add minced garlic and cook until fragrant, about 1 minute.\n4. Drain pasta and add to the pan with garlic oil.\n5. Toss to coat, then add Parmesan, salt, pepper, and red pepper flakes if using.\n6. Serve immediately.",
      },
      breakfast: {
        title: "Quick Breakfast Scramble",
        description: "A nutritious breakfast scramble that's ready in minutes.",
        estimatedTime: "15 minutes",
        ingredients: [
          "4 eggs",
          "1/4 cup milk",
          "1/2 cup diced vegetables (bell peppers, onions, spinach)",
          "1/4 cup shredded cheese",
          "Salt and pepper to taste",
        ],
        procedure:
          "1. Whisk eggs and milk together in a bowl.\n2. Heat a non-stick pan over medium heat.\n3. Add diced vegetables and cook until softened, about 2 minutes.\n4. Pour egg mixture over vegetables and scramble until eggs are cooked through.\n5. Sprinkle cheese on top and let melt.\n6. Season with salt and pepper and serve hot.",
      },
      dessert: {
        title: "Easy Fruit Crumble",
        description: "A simple fruit crumble that works with almost any fruit.",
        estimatedTime: "45 minutes",
        ingredients: [
          "2 cups mixed berries or diced fruit",
          "1/4 cup sugar",
          "1 cup rolled oats",
          "1/2 cup flour",
          "1/2 cup brown sugar",
          "1/2 cup cold butter, diced",
          "1 tsp cinnamon",
        ],
        procedure:
          "1. Preheat oven to 350°F (175°C).\n2. Place fruit in a baking dish and sprinkle with sugar.\n3. In a bowl, mix oats, flour, brown sugar, and cinnamon.\n4. Cut in butter until mixture is crumbly.\n5. Sprinkle oat mixture over fruit.\n6. Bake for 30-35 minutes until golden and bubbly.\n7. Let cool slightly before serving.",
      },
      soup: {
        title: "Simple Vegetable Soup",
        description: "A hearty vegetable soup that's perfect for any season.",
        estimatedTime: "30 minutes",
        ingredients: [
          "1 onion, diced",
          "2 carrots, diced",
          "2 celery stalks, diced",
          "2 cloves garlic, minced",
          "4 cups vegetable broth",
          "1 can diced tomatoes",
          "1 cup mixed vegetables",
          "1 tsp dried herbs (thyme, rosemary, oregano)",
          "Salt and pepper to taste",
        ],
        procedure:
          "1. Heat oil in a large pot over medium heat.\n2. Add onion, carrots, and celery. Cook until softened, about 5 minutes.\n3. Add garlic and cook for 1 minute more.\n4. Pour in broth and tomatoes, then add mixed vegetables and herbs.\n5. Bring to a boil, then reduce heat and simmer for 15-20 minutes.\n6. Season with salt and pepper before serving.",
      },
      salad: {
        title: "Quick Mediterranean Salad",
        description: "A refreshing salad with Mediterranean flavors.",
        estimatedTime: "15 minutes",
        ingredients: [
          "2 cups mixed greens",
          "1 cucumber, diced",
          "1 cup cherry tomatoes, halved",
          "1/2 red onion, thinly sliced",
          "1/2 cup feta cheese, crumbled",
          "1/4 cup kalamata olives",
          "2 tbsp olive oil",
          "1 tbsp lemon juice",
          "1 tsp dried oregano",
          "Salt and pepper to taste",
        ],
        procedure:
          "1. Combine mixed greens, cucumber, tomatoes, red onion, feta, and olives in a large bowl.\n2. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.\n3. Pour dressing over salad and toss gently to combine.\n4. Serve immediately.",
      },
    }

    // Add a small delay to simulate API call
    setTimeout(() => {
      resolve(mockRecipes[recipeType as keyof typeof mockRecipes])
    }, 500)
  })
}

// Function to generate an image based on a recipe
export async function generateRecipeImage(recipe: {
  title: string
  description: string
}): Promise<string | null> {
  // Check if OpenAI API key is available
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) {
    console.error("OpenAI API key is not configured")
    return mockImageGenerator(recipe)
  }

  try {
    const prompt = `A professional food photography image of ${recipe.title}. ${recipe.description}. Top-down view, beautiful plating, soft natural lighting, no text, no watermarks, high resolution.`

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024"
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const imageBase64 = data.data[0]?.b64_json

    if (!imageBase64) {
      throw new Error("No image data returned from OpenAI")
    }

    // Return the base64 encoded image with data URL prefix
    return `data:image/png;base64,${imageBase64}`
  } catch (error) {
    console.error("Error generating image:", error)
    // Fall back to mock image generator
    return mockImageGenerator(recipe)
  }
}

// Mock image generator for testing or when API is unavailable
function mockImageGenerator(recipe: { title: string }): string {
  // Generate a placeholder image with the recipe title
  const colors = [
    "#D08A3E", // Autumn orange
    "#A0522D", // Brown
    "#6B3A28", // Dark brown
    "#8B4513", // Saddle brown
    "#CD853F", // Peru
  ]

  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  // Create a canvas to generate the image
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return `https://via.placeholder.com/512x512/D08A3E/FFFFFF?text=${encodeURIComponent(recipe.title)}`
  }

  // Fill background
  ctx.fillStyle = randomColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add a subtle pattern
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = 50 + Math.random() * 100
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add text
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.font = "bold 32px sans-serif"

  // Wrap text
  const words = recipe.title.split(" ")
  let line = ""
  const lines = []
  const y = canvas.height / 2 - 20 * (words.length > 3 ? 3 : words.length)

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " "
    const metrics = ctx.measureText(testLine)
    if (metrics.width > canvas.width - 40 && i > 0) {
      lines.push(line)
      line = words[i] + " "
    } else {
      line = testLine
    }
  }
  lines.push(line)

  // Draw text lines
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, y + i * 40)
  })

  // Add a subtle food icon
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height - 100, 50, 0, Math.PI * 2)
  ctx.fill()

  // Return as data URL
  return canvas.toDataURL("image/png")
}

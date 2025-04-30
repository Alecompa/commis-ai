import type { Recipe } from "@/types"

// Function to generate a PDF from a recipe
export async function generateRecipePDF(recipe: Recipe): Promise<void> {
  // Dynamically import jsPDF and html2canvas to reduce bundle size
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")])

  try {
    // Create separate containers for each page
    const page1Container = document.createElement("div")
    const page2Container = document.createElement("div")
    
    // Set common styles for both containers
    const commonStyles = {
      width: "595px", // A4 width in pixels at 72 dpi
      padding: "40px",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
      position: "absolute",
      left: "-9999px",
      backgroundColor: "#fff",
      color: "#000" // Explicitly set text color to black for all content
    }
    
    // Apply styles to both containers
    Object.entries(commonStyles).forEach(([key, value]) => {
      page1Container.style[key as any] = value
      page2Container.style[key as any] = value
    })
    
    page1Container.style.top = "0"
    page2Container.style.top = "1000px" // Position far enough from the first page
    
    // Add containers to the DOM
    document.body.appendChild(page1Container)
    document.body.appendChild(page2Container)

    // --- PAGE 1: Title, Description, Time, Image, and Ingredients ---

    // Add recipe title
    const title = document.createElement("h1")
    title.textContent = recipe.title
    title.style.fontSize = "24px"
    title.style.marginBottom = "10px"
    title.style.color = "#D08A3E"
    page1Container.appendChild(title)

    // Add recipe description
    const description = document.createElement("p")
    description.textContent = recipe.description
    description.style.fontSize = "14px"
    description.style.marginBottom = "20px"
    description.style.fontStyle = "italic"
    description.style.color = "#000" // Ensure text is black
    page1Container.appendChild(description)

    // Add cooking time
    const time = document.createElement("p")
    time.textContent = `Cooking Time: ${recipe.estimatedTime}`
    time.style.fontSize = "14px"
    time.style.marginBottom = "20px"
    time.style.fontWeight = "bold"
    time.style.color = "#000" // Ensure text is black
    page1Container.appendChild(time)

    // Centered image below cooking time
    if (recipe.image) {
      const imageContainer = document.createElement("div")
      imageContainer.style.display = "flex"
      imageContainer.style.justifyContent = "center"
      imageContainer.style.alignItems = "center"
      imageContainer.style.marginBottom = "24px"

      const img = document.createElement("img")
      img.src = recipe.image
      img.style.maxWidth = "85%"
      img.style.maxHeight = "320px"
      img.style.objectFit = "contain"

      imageContainer.appendChild(img)
      page1Container.appendChild(imageContainer)
    }

    // Ingredients in two columns
    const ingredientsSection = document.createElement("div")
    ingredientsSection.style.display = "flex"
    ingredientsSection.style.flexDirection = "column"
    ingredientsSection.style.marginBottom = "20px"

    const ingredientsTitle = document.createElement("h2")
    ingredientsTitle.textContent = "Ingredients"
    ingredientsTitle.style.fontSize = "15px"
    ingredientsTitle.style.marginBottom = "8px"
    ingredientsTitle.style.marginTop = "0"
    ingredientsTitle.style.borderBottom = "1px solid #D08A3E"
    ingredientsTitle.style.paddingBottom = "3px"
    ingredientsSection.appendChild(ingredientsTitle)

    // Two-column list
    const columnsWrapper = document.createElement("div")
    columnsWrapper.style.display = "flex"
    columnsWrapper.style.gap = "24px"

    // Split ingredients into two columns
    const mid = Math.ceil(recipe.ingredients.length / 2)
    const col1 = recipe.ingredients.slice(0, mid)
    const col2 = recipe.ingredients.slice(mid)

    const makeList = (items: string[]) => {
      const ul = document.createElement("ul")
      ul.style.paddingLeft = "18px"
      ul.style.marginBottom = "0"
      ul.style.fontSize = "12px"
      ul.style.color = "#000" // Ensure list text is black
      items.forEach((ingredient) => {
        const li = document.createElement("li")
        li.textContent = ingredient
        li.style.fontSize = "12px"
        li.style.marginBottom = "3px"
        li.style.color = "#000" // Ensure list item text is black
        ul.appendChild(li)
      })
      return ul
    }

    columnsWrapper.appendChild(makeList(col1))
    columnsWrapper.appendChild(makeList(col2))
    ingredientsSection.appendChild(columnsWrapper)
    page1Container.appendChild(ingredientsSection)
    
    // Add footer to page 1
    const footer1 = document.createElement("div")
    footer1.style.marginTop = "30px"
    footer1.style.borderTop = "1px solid #D08A3E"
    footer1.style.paddingTop = "10px"
    footer1.style.fontSize = "12px"
    footer1.style.textAlign = "center"
    footer1.style.color = "#666"
    footer1.textContent = `Generated by Commis AI on ${new Date().toLocaleDateString()}`
    page1Container.appendChild(footer1)

    // --- PAGE 2: Instructions ---
    
    // Add recipe title again (for page 2 reference)
    const title2 = document.createElement("h1")
    title2.textContent = recipe.title
    title2.style.fontSize = "24px"
    title2.style.marginBottom = "20px"
    title2.style.color = "#D08A3E"
    page2Container.appendChild(title2)
    
    // Add procedure section
    const procedureTitle = document.createElement("h2")
    procedureTitle.textContent = "Instructions"
    procedureTitle.style.fontSize = "15px"
    procedureTitle.style.marginBottom = "8px"
    procedureTitle.style.borderBottom = "1px solid #D08A3E"
    procedureTitle.style.paddingBottom = "3px"
    page2Container.appendChild(procedureTitle)

    const procedure = document.createElement("div")
    procedure.style.fontSize = "12px"
    procedure.style.lineHeight = "1.6"
    procedure.style.marginBottom = "20px"

    // Format the procedure text
    const formattedProcedure = recipe.procedure
      .split("\n")
      .map((line) => `<p style="margin: 0 0 8px 0; color: #000;">${line}</p>`)
      .join("")

    procedure.innerHTML = formattedProcedure
    page2Container.appendChild(procedure)

    // Add footer to page 2
    const footer2 = document.createElement("div")
    footer2.style.marginTop = "30px"
    footer2.style.borderTop = "1px solid #D08A3E"
    footer2.style.paddingTop = "10px"
    footer2.style.fontSize = "12px"
    footer2.style.textAlign = "center"
    footer2.style.color = "#666"
    footer2.textContent = `Generated by Commis AI on ${new Date().toLocaleDateString()}`
    page2Container.appendChild(footer2)

    // Generate PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    })

    // Function to process a container into a PDF page
    const processPage = async (container: HTMLElement, addNewPage: boolean = false) => {
      // Force all text elements to be black before rendering
      const textElements = container.querySelectorAll('p, h1, h2, h3, li, span, div')
      textElements.forEach(el => {
        (el as HTMLElement).style.color = "#000"
      })
      
      const canvas = await html2canvas(container, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#fff",
      })
      
      if (addNewPage) {
        pdf.addPage()
      }
      
      const imgData = canvas.toDataURL("image/png")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate aspect ratio to fit the page
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      const imgPdfWidth = imgWidth * ratio
      const imgPdfHeight = imgHeight * ratio
      
      // Center the image
      const x = (pdfWidth - imgPdfWidth) / 2
      const y = 0 // Start from top
      
      pdf.addImage(imgData, "PNG", x, y, imgPdfWidth, imgPdfHeight)
    }
    
    // Process page 1
    await processPage(page1Container)
    
    // Process page 2
    await processPage(page2Container, true)

    // Save the PDF
    pdf.save(`${recipe.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)

    // Clean up
    document.body.removeChild(page1Container)
    document.body.removeChild(page2Container)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
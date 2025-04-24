import { memo } from "react"

// Use memo to prevent unnecessary re-renders
export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <footer className="w-full py-4 bg-background border-t border-border h-16">
      <div className="container flex flex-col items-center justify-center h-full px-4 mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Commis AI. Made with ❤️ by Alessandro Compagnucci.
        </p>
      </div>
    </footer>
  )
})

import ClientOnly from "@/components/client-only"
import KitchenApp from "@/components/kitchen-app"

export default function Home() {
  return (
    <ClientOnly>
      <KitchenApp />
    </ClientOnly>
  )
}

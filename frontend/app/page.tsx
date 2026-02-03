"use client"

import { Button } from "@heroui/react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Blod, Svett, Tårar</h1>
      <p className="text-gray-600">Dark Adaptation Knowledge Base</p>
      <Button 
        variant="primary" 
        onPress={() => console.log("HeroUI v3 works!")}
      >
        Test HeroUI v3 Button
      </Button>
    </div>
  )
}

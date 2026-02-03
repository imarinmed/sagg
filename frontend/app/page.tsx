"use client"

import { Card } from "@heroui/react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Blod, Svett, Tårar
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Dark Adaptation Knowledge Base
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          A comprehensive wiki for the dark, explicit adaptation of the Swedish YA vampire series
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/episodes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Episodes</h2>
            </Card.Header>
            <Card.Content>
              <p className="text-gray-600 dark:text-gray-400">
                Browse all 7 episodes with scene breakdowns and character appearances
              </p>
            </Card.Content>
          </Card>
        </Link>

        <Link href="/characters">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Characters</h2>
            </Card.Header>
            <Card.Content>
              <p className="text-gray-600 dark:text-gray-400">
                Character profiles with canonical and adaptation tracking
              </p>
            </Card.Content>
          </Card>
        </Link>

        <Link href="/mythos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mythos</h2>
            </Card.Header>
            <Card.Content>
              <p className="text-gray-600 dark:text-gray-400">
                Vampire lore, blood bonds, and world-building elements
              </p>
            </Card.Content>
          </Card>
        </Link>

        <Link href="/graph">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Graph</h2>
            </Card.Header>
            <Card.Content>
              <p className="text-gray-600 dark:text-gray-400">
                Visual relationship graph connecting all entities
              </p>
            </Card.Content>
          </Card>
        </Link>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Project Status
        </h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>✅ 7 episodes parsed and indexed</li>
          <li>✅ 9 character profiles created</li>
          <li>✅ 7 mythos elements cataloged</li>
          <li>🔄 Frontend wiki interface (in progress)</li>
          <li>⏳ Graph visualization (pending)</li>
        </ul>
      </div>
    </div>
  )
}

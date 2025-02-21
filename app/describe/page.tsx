"use client"

import React, { useState } from 'react'
import { FilmCard } from '../components/FilmCard'
import { Button, Input } from '../page'
import type { Film } from "../../types/film";

export default function DescribePage() {
  const [description, setDescription] = useState('')
  const [results, setResults] = useState<Film[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch films')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('An error occurred while fetching films. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Describe a Film</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter a description for the film"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {results.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MoodMatch Films. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

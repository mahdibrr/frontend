'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, Star, Calendar, Globe, Film, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { LikeButton } from '../../components/likeButtton'
import { format } from 'date-fns'
import { useAuth } from '@clerk/nextjs' // Import useAuth from Clerk
import { Card, CardContent } from '../../components/button'

interface FilmDetails {
  id: string
  title: string
  director: string
  cover_image: string
  trailer_url: string
  description: string
  release_date: string
  language: string
  genres: string[]
  rating: string
  actors: { name: string, profile_path: string | null }[]
}

export default function FilmDetailsPage({ searchParams }: { searchParams: any }) {
  const { id } = React.use(searchParams) as { id: string }
  const { userId, getToken } = useAuth(); // Get user authentication status and userId
  const [film, setFilm] = useState<FilmDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [likedMovies, setLikedMovies] = useState<string[]>([])

  // Load liked movies from localStorage on mount
  useEffect(() => {
    const storedLikedMovies = localStorage.getItem('likedMovies');
    if (storedLikedMovies) {
      setLikedMovies(JSON.parse(storedLikedMovies));
    }
  }, []);

  // Fetch liked movies when user is authenticated
  useEffect(() => {
    const fetchLikedMovies = async () => {
      if (!userId) return;
      try {
        const sessionToken = await getToken();
        const response = await fetch('/api/liked_movies', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'User-ID': userId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.likedMovies)) {
            setLikedMovies(data.likedMovies.map((movie: { id: string }) => movie.id));
          } else {
            console.error('Unexpected response format:', data);
          }
        } else {
          const errorText = await response.text();
          console.error(`Failed to fetch liked movies: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching liked movies:', error);
      }
    };
    fetchLikedMovies();
  }, [userId, getToken]);

  const handleLike = async (movieId: string, liked: boolean) => {
    if (!userId) return;
    try {
      const sessionToken = await getToken();
      console.log(`User ID: ${userId}`);
      const response = await fetch('/api/like_movie', {
        method: liked ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'User-ID': userId,
        },
        body: JSON.stringify({ movieId, liked }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error liking/unliking movie: ${response.status} ${response.statusText} - ${errorText}`);
        return;
      }
      setLikedMovies((prev) => {
        const isAlreadyLiked = prev.includes(movieId);
        if (liked && !isAlreadyLiked) {
          const updatedLikedMovies = [...prev, movieId];
          localStorage.setItem('likedMovies', JSON.stringify(updatedLikedMovies));
          return updatedLikedMovies;
        } else if (!liked && isAlreadyLiked) {
          const updatedLikedMovies = prev.filter(id => id !== movieId);
          localStorage.setItem('likedMovies', JSON.stringify(updatedLikedMovies));
          return updatedLikedMovies;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error liking/unliking movie:', error);
    }
  };

  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        const response = await fetch(`/api/film/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch film details')
        }
        const data = await response.json()
        setFilm(data)
      } catch (error) {
        console.error('An error occurred while fetching film details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFilmDetails()
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!film) {
    return <div className="flex justify-center items-center h-screen">Film not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{film.title}</h1>
          <LikeButton
            movieId={film.id}
            initialLiked={likedMovies.includes(film.id)}
            onLike={handleLike}
            className="ml-auto"
          />
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Image
                src={film.cover_image || "/placeholder.svg"}
                alt={film.title}
                width={500}
                height={750}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-2/3">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">About the Film</h2>
                <p className="text-gray-700">{film.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">Director: {film.director}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">Release Date: {format(new Date(film.release_date), 'MM/dd/yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">Language: {film.language}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">Rating: {film.rating}</span>
                </div>
                <div className="flex items-center">
                  <Film className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">Genres: {film.genres.join(', ')}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {film.actors.map((actor, index) => (
                    <Card key={`${film.id}-${actor.name}-${index}`} className="overflow-hidden bg-gray-100">
                      <CardContent className="p-3 bg gray-100">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="w-20 h-20 mb-2">
                            {actor.profile_path ? (
                              <AvatarImage src={actor.profile_path} alt={actor.name} />
                            ) : (
                              <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm font-medium mt-10">{actor.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {film.trailer_url && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Trailer</h3>
                  <div className="aspect-w-16 aspect-h-9" style={{ height: '300px' }}>
                    <iframe
                      src={film.trailer_url}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'
import { useUser, useAuth } from '@clerk/nextjs'; // Import useAuth
import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react' // Import missing icons

import Image from "next/image"
import Link from 'next/link'
import { Button, Card, CardContent } from '../page';

interface Movie {
  id: string
  title: string
  cover_image: string
}

export default function LikedMovies() {
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]) 
  const [isLoading, setIsLoading] = useState(true); 
  const { user } = useUser() 
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchLikedMovies = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const sessionToken = await getToken(); // Get the session token without specifying a template
        const userId = user.id; // Get the user ID
        console.log(`User ID: ${userId}`); // Debugging: log the user ID

        const response = await fetch('/api/liked_movies', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`, // Use the session token
            'User-ID': userId, // Pass the user ID in the headers
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching liked movies: ${response.status} ${response.statusText} - ${errorText}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (data && Array.isArray(data.likedMovies)) {
          const movieDetailsPromises = data.likedMovies.map(async (movie: Movie) => {
            const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
            const tmdbData = await tmdbResponse.json();
            console.log(`TMDB Data for movie ID ${movie.id}:`, tmdbData); // Debugging: log the TMDB data
            return {
              ...movie,
              title: tmdbData.title,
              cover_image: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '/placeholder.svg',
            };
          });

          const moviesWithDetails = await Promise.all(movieDetailsPromises);
          setLikedMovies(moviesWithDetails);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (error) {
        console.error('Error fetching liked movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedMovies();
  }, [user, getToken]);

  const removeMovie = async (id: string) => {
    if (!user) return;

    try {
      const sessionToken = await getToken(); // Get the session token without specifying a template
      const userId = user.id; // Get the user ID
      console.log(`User ID: ${userId}`); // Debugging: log the user ID

      const response = await fetch(`/api/unlike_movie/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`, // Use the session token
          'User-ID': userId, // Pass the user ID in the headers
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error unliking movie: ${response.status} ${response.statusText} - ${errorText}`);
        return;
      }

      setLikedMovies((prev) => {
        const updatedLikedMovies = prev.filter(movie => movie.id !== id);
        localStorage.setItem('likedMovies', JSON.stringify(updatedLikedMovies));
        return updatedLikedMovies;
      });
    } catch (error) {
      console.error('Error unliking movie:', error);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Your Liked Movies</h2>
        {isLoading ? (
          <p className="text-center text-muted-foreground">LOADING...</p>
        ) : likedMovies.length === 0 ? (
          <p className="text-center text-muted-foreground">You haven&apos;t liked any movies yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.cover_image || "/placeholder.svg"}
                    alt={`Poster of ${movie.title}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg truncate">{movie.title}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm">
                      <Link href={`/film/${movie.id}`}>View Details</Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeMovie(movie.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'; // Import useAuth
import { motion, AnimatePresence } from 'framer-motion'
import { FilmCard } from '../components/FilmCard'
import { FilmCardLayout } from '../components/likeButtton'

interface Film {
  id: string
  title: string
  cover_image: string
  rating?: number
  year?: number
  genres?: string[]
}

export default function SearchSimilar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Film[]>([])
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [similarFilms, setSimilarFilms] = useState<Film[]>([])
  const [likedMovies, setLikedMovies] = useState<string[]>([]) // Ensure likedMovies is initialized as an empty array
  const { user } = useUser() // Get the current user
  const { getToken } = useAuth() // Get the getToken method from useAuth

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setSelectedFilm(null); // Reset selected film when search query changes

    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
      const data = await response.json();

      if (data.results) {
        const results: Film[] = data.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          cover_image: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.svg',
        }));

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching data from TMDB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimilarSearch = async () => {
    if (!selectedFilm) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/search_similar_films', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_film_id: selectedFilm.id }),
      });
      const data = await response.json();
      setSimilarFilms(data);
      setSelectedFilm(null); 
      setSearchResults([]); 
    } catch (error) {
      console.error('Error fetching similar films:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedLikedMovies = localStorage.getItem('likedMovies');
    if (storedLikedMovies) {
      setLikedMovies(JSON.parse(storedLikedMovies));
    }
  }, []);

  const handleLike = async (movieId: string, liked: boolean) => {
    if (!user) return;
  
    try {
      const sessionToken = await getToken(); // Get the session token without specifying a template
      const userId = user.id; // Get the user ID
      console.log(`User ID: ${userId}`); // Debugging: log the user ID
  
      const response = await fetch('/api/like_movie', {
        method: liked ? 'POST' : 'DELETE', // Use DELETE method for unliking
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`, // Use the session token
          'User-ID': userId, // Pass the user ID in the headers
        },
        body: JSON.stringify({ movieId, liked }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error liking/unliking movie: ${response.status} ${response.statusText} - ${errorText}`);
        return;
      }
  
      setLikedMovies((prev) => {
        const isAlreadyLiked = prev?.includes(movieId); // Ensure prev is defined
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
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLikedMovies = async () => {
      if (!user) return;

      try {
        const sessionToken = await getToken();
        const response = await fetch('/api/liked_movies', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'User-ID': user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.likedMovies)) {
            setLikedMovies(data.likedMovies.map((movie: { id: string }) => movie.id)); // Extract movie IDs
          } else {
            console.error('Unexpected response format:', data);
          }
        } else {
          const errorText = await response.text(); // Get the error text from the response
          console.error(`Failed to fetch liked movies: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching liked movies:', error);
      }
    };

    fetchLikedMovies();
  }, [user, getToken]);

  return (
    // Pass handleLike as a prop to FilmCardLayout
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Search Similar Films</h2>
      <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto mb-8 ">
<div className="flex gap-2">
    <input
        type="text"
        placeholder="Enter a movie title"
        value={searchQuery}
        onChange={(e) => {
            setSearchQuery(e.target.value)
            setSimilarFilms([]) // Clear similar films when search query changes
        }}
        className="flex-grow border border-gray-300 rounded px-2 py-1"
    />
</div>
      </form>

      {similarFilms.length === 0 ? (
        <FilmCardLayout
          selectedFilm={selectedFilm}
          searchResults={searchResults}
          similarFilms={similarFilms}
          likedMovies={likedMovies}
          onSelectFilm={setSelectedFilm}
          onLike={handleLike}
          onSimilarSearch={handleSimilarSearch}
          isLoading={isLoading} />
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {similarFilms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Similar Films</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarFilms.map((movie) => (
                    <div key={movie.id} onClick={() => setSelectedFilm(movie)}>
                      <FilmCard film={movie} likedMovies={likedMovies} onLike={handleLike} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  )
}


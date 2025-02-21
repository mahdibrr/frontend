import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button, Card } from '../page';
import { Badge } from './badge';
import { cn } from 'app/src/middleware';
import { Link, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { FilmCard } from './FilmCard';

interface FilmCardLayoutProps {
  selectedFilm: Film | null;
  searchResults: Film[];
  similarFilms: Film[];
  likedMovies: string[];
  onSelectFilm: (film: Film | null) => void;
  onLike: (movieId: string, liked: boolean) => Promise<void>;
  onSimilarSearch: () => void;
  isLoading: boolean;
}

interface Film {
  id: string;
  title: string;
  cover_image: string;
  year?: number;
  genres?: string[];
}

export function FilmCardLayout({
    selectedFilm,
    searchResults,
    similarFilms,
    likedMovies = [], // Ensure likedMovies is always an array
    onSelectFilm,
    onLike,
    onSimilarSearch,
    isLoading
  }: FilmCardLayoutProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
  
    useEffect(() => {
      setCurrentIndex(0)
    }, [])
  
    const handlePrevious = () => {
      if (searchResults) {
        setCurrentIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : Math.ceil(searchResults.length / 3) - 1
        )
      }
    }
  
    const handleNext = () => {
      if (searchResults) {
        setCurrentIndex((prevIndex) => 
          prevIndex < Math.ceil(searchResults.length / 3) - 1 ? prevIndex + 1 : 0
        )
      }
    }
  
    // Filter out duplicate films
    const uniqueSearchResults = Array.from(new Set(searchResults.map(film => film.id)))
      .map(id => searchResults.find(film => film.id === id))
      .filter((film): film is Film => film !== undefined); // Ensure film is not undefined
  
    const uniqueSimilarFilms = Array.from(new Set(similarFilms.map(film => film.id)))
      .map(id => similarFilms.find(film => film.id === id))
      .filter((film): film is Film => film !== undefined); // Ensure film is not undefined
  
    return (
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {selectedFilm ? (
            <motion.div
              key="selected-film"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-8"
            >
              <div className="w-full md:w-1/3">
                <Card className="overflow-hidden shadow-lg">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={selectedFilm.cover_image || "/placeholder.svg?height=600&width=400"}
                      alt={`Poster of ${selectedFilm.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <h2 className="text-3xl font-bold">{selectedFilm.title}</h2>
                {selectedFilm.year && <p className="text-xl text-muted-foreground">{selectedFilm.year}</p>}
                {selectedFilm.genres && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFilm.genres.map((genre) => (
                      <Badge key={`${selectedFilm.id}-${genre}`} className="text-sm">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={() => onSelectFilm(null)}>
                    Back to Results
                  </Button>
                  <LikeButton
                    movieId={selectedFilm.id}
                    initialLiked={likedMovies.includes(selectedFilm.id)}
                    onLike={onLike}
                  />
                  <Button variant="default">
                    <Link href={`/film/${selectedFilm.id}`}>View Details</Link>
                  </Button>
                </div>
                <Button onClick={onSimilarSearch} disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? 'Searching...' : 'Find Similar Films'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniqueSearchResults && uniqueSearchResults.length > 0
                    ? uniqueSearchResults.slice(currentIndex * 3, (currentIndex + 1) * 3).map((movie) => (
                        <div key={movie.id} onClick={() => onSelectFilm(movie)}>
                          <FilmCard film={movie} onLike={onLike} />
                        </div>
                      ))
                    : <p className="col-span-3 text-center text-muted-foreground">No search results found.</p>
                  }
                </div>
                {uniqueSearchResults && uniqueSearchResults.length > 3 && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto"
                      onClick={handleNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  
        <AnimatePresence>
          {uniqueSimilarFilms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">Similar Films</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueSimilarFilms.map((movie) => (
                  <div key={movie.id} onClick={() => onSelectFilm(movie)}>
                    <FilmCard film={movie} onLike={function (movieId: string, liked: boolean): Promise<void> {
                      throw new Error('Function not implemented.')
                    } } />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
interface LikeButtonProps {
  movieId: string;
  initialLiked?: boolean;
  onLike: (movieId: string, liked: boolean) => Promise<void>;
  className?: string;
}

export function LikeButton({ movieId, initialLiked = false, onLike, className }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [isLoading, setIsLoading] = useState(false)
  
    const handleLike = async () => {
      setIsLoading(true)
      try {
        await onLike?.(movieId, !liked)
        setLiked(!liked)
      } catch (error) {
        console.error('Error toggling like:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "group relative",
          {"text-red-500" : liked, "cursor-not-allowed":isLoading},
          className
        )} 
        onClick={handleLike}
        disabled={isLoading}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={cn(
            "h-6 w-6 transition-all duration-300 ease-in-out",
            liked ? "fill-current scale-110" : undefined,
            "group-hover:scale-125",
            isLoading ? "animate-pulse" : undefined
          )}
        />
        <span className="sr-only">{liked ? 'Unlike' : 'Like'}</span>
        <span
          className={cn(
            "absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transition-all duration-300 ease-in-out",
            liked ? "opacity-100 scale-100" : "opacity-0 scale-0",
          )}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          +1
        </span>
      </Button>
    )
  }
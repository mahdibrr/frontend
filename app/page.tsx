'use client'
import { UserButton, SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs'; // Import useAuth from Clerk
import { useState, useEffect } from 'react'
import { Film, Home, Users, Heart, Search, Sun, Moon, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FilmCard } from './components/FilmCard' // Import the FilmCard component

// Utility function for merging class names
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ children, className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        variant === 'default' ? "bg-primary text-primary-foreground hover:bg-primary/90" : undefined,
        variant === 'outline' ? "border border-input hover:bg-accent hover:text-accent-foreground" : undefined,
        variant === 'ghost' ? "hover:bg-accent hover:text-accent-foreground" : undefined,
        size === 'default' ? "h-10 py-2 px-4" : undefined,
        size === 'sm' ? "h-9 px-3 rounded-md" : undefined,
        size === 'lg' ? "h-11 px-8 rounded-md" : undefined,
        size === 'icon' ? "h-10 w-10" : undefined,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'secondary' }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === 'default' ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : undefined,
        variant === 'secondary' ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : undefined,
        className
      )}
    >
      {children}
    </span>
  )
}

export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm ", className)} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (checked: boolean) => void; className?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-input data-[state=unchecked]:bg-primary",
        className
      )}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </button>
  )
}

interface MovieRecommendation {
  id: string
  title: string
  director: string
  description: string
  poster_url: string
  mood: string
  cover_image: string
}

interface Actor {
  id: number
  name: string
  profile_path: string | null
}

const updateQueryParams = (key: string, value: string | null) => {
  const params = new URLSearchParams(window.location.search)
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState({}, '', newUrl)
}

const MoodMatchFilms = () => {
  const { isLoaded, userId } = useAuth(); // Get user authentication status and userId
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [currentSection, setCurrentSection] = useState('preferences')
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null)
  const [actorSearchQuery, setActorSearchQuery] = useState('')
  const [actorSearchResults, setActorSearchResults] = useState<Actor[]>([])
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [releaseDateStart, setReleaseDateStart] = useState<string>('')
  const [releaseDateEnd, setReleaseDateEnd] = useState<string>('')

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [likedMovies, setLikedMovies] = useState<string[]>([]); // State to store liked movies

  // Fetch liked movies when user is authenticated

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const setSelectedMoodWithQuery = (mood: string | null) => {
    setSelectedMood(mood)
    updateQueryParams('mood', mood)
  }

  const setSelectedGenreWithQuery = (genre: string | null) => {
    setSelectedGenre(genre)
    updateQueryParams('genre', genre)
  }

  const setSelectedLanguageWithQuery = (language: string | null) => {
    setSelectedLanguage(language)
    updateQueryParams('language', language)
  }

  const setSelectedActorWithQuery = (actor: Actor | null) => {
    setSelectedActor(actor)
    updateQueryParams('actor', actor?.name || null)
  }

  const setReleaseDateStartWithQuery = (date: string) => {
    setReleaseDateStart(date)
    updateQueryParams('release_date_start', date)
  }

  const setReleaseDateEndWithQuery = (date: string) => {
    setReleaseDateEnd(date)
    updateQueryParams('release_date_end', date)
  }

  const steps = [
    { title: 'Mood', component: MoodSelector },
    { title: 'Language', component: LanguageSelector },
    { title: 'Genre', component: GenreSelector },
    { title: 'Actor', component: ActorSearch },
    { title: 'Release Date Range', component: ReleaseDateSelector },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (
        (currentStep === 0 && !selectedMood) ||
        (currentStep === 1 && !selectedLanguage) ||
        (currentStep === 2 && !selectedGenre)
      ) {
        setError('Please make a selection before proceeding.')
        return
      }
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      if (!selectedMood || !selectedLanguage || !selectedGenre) {
        setError('Please fill in all required fields before getting recommendations.')
        return
      }
      getRecommendations()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/search_films', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: selectedMood,
          language: selectedLanguage,
          genre: selectedGenre,
          actor: selectedActor?.name,
          release_date_start: releaseDateStart,
          release_date_end: releaseDateEnd,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      const data = await response.json()
      setRecommendations(data)
      setCurrentSection('recommendations')
    } catch (err) {
      setError('An error occurred while fetching recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const searchActors = async (query: string) => {
    if (query.length < 2) {
      setActorSearchResults([])
      return
    }
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!apiKey) {
      console.error('TMDB API key is not set')
      setError('TMDB API key is not set')
      return
    }
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch actors')
      }
      const data = await response.json()
      setActorSearchResults(data.results)
    } catch (err) {
      console.error('Error searching actors:', err)
      setError('Failed to fetch actors')
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchActors(actorSearchQuery)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [actorSearchQuery])

  function MoodSelector() {
    const moods = ['😊 Happy', '😌 Relaxing', '🤔 Thought-provoking', '🎢 Thrilling', '🥰 Romantic', '🎭 Dramatic', '🧘‍♀️ Inspiring', '😂 Funny']
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <Button 
            key={mood} 
            variant={selectedMood === mood ? "default" : "outline"} 
            className="h-16 text-lg"
            onClick={() => setSelectedMoodWithQuery(mood)}
          >
            {mood}
          </Button>
        ))}
      </div>
    )
  }

  function GenreSelector() {
    const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Romance', 'Thriller', 'Horror', 'Documentary']
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <Button 
            key={genre} 
            variant={selectedGenre === genre ? "default" : "outline"} 
            className="h-16 text-lg"
            onClick={() => setSelectedGenreWithQuery(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
    )
  }

  function LanguageSelector() {
    const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Other']
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {languages.map((language) => (
          <Button 
            key={language} 
            variant={selectedLanguage === language ? "default" : "outline"} 
            className="h-16 text-lg"
            onClick={() => setSelectedLanguageWithQuery(language)}
          >
            {language}
          </Button>
        ))}
      </div>
    )
  }

  function ActorSearch() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="actor-search" className="block text-sm font-medium text-foreground">
            Search for an actor:
          </label>
          <Input
            type="text"
            id="actor-search"
            placeholder="Enter actor name"
            value={actorSearchQuery}
            onChange={(e) => setActorSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        {actorSearchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select an actor:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {actorSearchResults
                .filter((actor) => actor.profile_path) // Filter actors with profile images
                .map((actor) => (
                  <Button
                    key={actor.id}
                    variant={selectedActor?.id === actor.id ? "default" : "outline"}
                    className="h-24 text-sm flex flex-col items-center justify-center h-40"
                    onClick={() => setSelectedActorWithQuery(actor)}
                  >
                    <Image
                src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                alt={actor.name}
                width={50}
                height={50}
                className="w-24 h-24 rounded-full mb-2 object-cover"
              />
                    {actor.name}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  function ReleaseDateSelector() {

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === '' || (Number(value) >= 1900 && Number(value) <= 2025)) {
        setReleaseDateStartWithQuery(value)
      }
    }
  
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === '' || (Number(value) >= 1900 && Number(value) <= 2025)) {
        setReleaseDateEndWithQuery(value)
      }
    }
  
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="release_date_start" className="block text-sm font-medium text-foreground">
            Release Date Start
          </label>
          <Input
            type="number"
            id="release_date_start"
            value={releaseDateStart}
            onChange={handleStartDateChange}
            min="1900"
            max="2025"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="release_date_end" className="block text-sm font-medium text-foreground">
            Release Date End
          </label>
          <Input
            type="number"
            id="release_date_end"
            value={releaseDateEnd}
            onChange={handleEndDateChange}
            min="1900"
            max="2025"
            className="w-full"
          />
        </div>
        {releaseDateStart && releaseDateEnd && Number(releaseDateStart) >= Number(releaseDateEnd) && (
          <div className="text-red-500 text-sm">
            Release Date Start must be less than Release Date End.
          </div>
        )}
      </div>
    )
  }
  

  function Recommendations() {
    const router = useRouter()

    const handleFilmClick = (title: string) => {
      router.push(`/film/${encodeURIComponent(title)}`)
    }

    // Updated handleLike: removed getToken call and using an empty token placeholder.
    const handleLike = async (movieId: string, liked: boolean) => {
      if (!Users) return;
  
      try {
        // For demo purposes, token is set to an empty string; adjust if token is needed.
        const sessionToken = '';
        const currentUserId = userId; // Get the user ID
        console.log(`User ID: ${userId}`); // Debug: log the user ID
  
        const response = await fetch('/api/like_movie', {
          method: liked ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
            'User-ID': userId || '',
          },
          body: JSON.stringify({ movieId, liked }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error liking/unliking movie: ${response.status} ${response.statusText} - ${errorText}`);
          return;
        }
  
        setLikedMovies((prev) => {
          const isAlreadyLiked = prev?.includes(movieId);
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
  

    return (
      <section className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">Your Personalized Recommendations</h2>
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Preferences:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedMood && <Badge variant="secondary">{selectedMood}</Badge>}
            {selectedLanguage && <Badge variant="secondary">{selectedLanguage}</Badge>}
            {selectedGenre && <Badge variant="secondary">{selectedGenre}</Badge>}
            {selectedActor && <Badge variant="secondary">{selectedActor.name}</Badge>}
            {releaseDateStart && <Badge variant="secondary">From: {releaseDateStart}</Badge>}
            {releaseDateEnd && <Badge variant="secondary">To: {releaseDateEnd}</Badge>}
          </div>
        </div>
        {isLoading ? (
          <div className="text-center">
            <p className="text-xl">Loading recommendations...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p className="text-xl">{error}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((movie) => (
              <FilmCard key={movie.id} film={movie} onLike={handleLike} /> // Use FilmCard component
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Button onClick={() => {setCurrentSection('preferences'); setCurrentStep(0);}}>Start Over</Button>
        </div>
      </section>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">

        {currentSection === 'preferences' && (
          <section className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">Find Your Perfect Movie</h2>
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              <div className="py-4">
                {steps[currentStep].component()}
              </div>
              {error && (
                <div className="text-red-500 mt-4 text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-between mt-8">
                <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Get Recommendations' : 'Next'}
                  {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </section>
        )}

        {currentSection === 'recommendations' && (
          <Recommendations />
        )}
      </main>

  )}

export default MoodMatchFilms
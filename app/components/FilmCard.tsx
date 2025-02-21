import { motion } from 'framer-motion';
import { Button, Card, CardContent } from '../page';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import { Badge } from './badge';
import Link from 'next/link';

interface Film {
  id: string;
  title: string;
  cover_image: string;
  rating?: number;
  year?: number;
  genres?: string[];
}

interface FilmCardProps {
  film: Film;
  likedMovies?: string[];
  onLike?: (movieId: string, liked: boolean) => Promise<void>;
  
}

export const FilmCard = ({ film, onLike }: FilmCardProps) => {
  return (
    <motion.div
      key={film.id} // Ensure unique key
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <div className="relative aspect-[2/3]">
          <Image
            src={film.cover_image || '/placeholder.svg?height=450&width=300'}
            alt={`Poster of ${film.title}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-lg truncate">{film.title}</h3>
              {film.year && <p className="text-sm">{film.year}</p>}
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            {film.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{film.rating.toFixed(1)}</span>
              </div>
            )}
            {onLike && (
              <button
                onClick={() => onLike(film.id, true)}
                className="p-1 rounded-full hover:bg-gray-200 transition"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
          {film.genres && (
            <div className="flex flex-wrap gap-1 mt-2">
              {film.genres.slice(0, 2).map((genre) => (
                <Badge key={`${film.id}-${genre}`} variant="secondary" className="text-xs"> 
                  {genre}
                </Badge>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Link href={`/film/${film.id}`}>View Details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

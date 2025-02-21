export interface Film {
  id: string;
  title: string;
  cover_image: string;
  rating?: number;
  year?: number;
  genres?: string[];
}

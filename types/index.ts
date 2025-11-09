export interface MovieBase {
  url: string;
  title: string;
  rating: number;
}

export interface UserAMovie extends MovieBase {}

// FIX: Add missing MovieRecommendation type to resolve import error in MovieCard.tsx.
export interface MovieRecommendation extends MovieBase {
  posterUrl: string;
}

export interface ProgressUpdate {
  user: string;
  message: string;
  currentPage: number;
  totalPages: number;
}

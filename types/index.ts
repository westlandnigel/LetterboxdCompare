export interface MovieBase {
  url: string;
  title: string;
  rating: number;
}

export interface UserAMovie extends MovieBase {}

// MovieRecommendation is unused and can be removed or kept if intended for future use.
// For the current purpose, SharedMovie will fulfill the need for detailed movie info.
export interface MovieRecommendation extends MovieBase {
  posterUrl: string;
}

export interface SharedMovie {
  url: string;
  title: string;
  userARating: number;
  userAPosterUrl: string;
  userBRating: number;
  userBPosterUrl: string;
  combinedRating: number;
}

export interface ProgressUpdate {
  user: string;
  message: string;
  currentPage: number;
  totalPages: number;
}
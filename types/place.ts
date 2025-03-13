export interface BasePlace {
  ID: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  pointValue: number;
  placeImage: string;
}

export interface User {
  ID: number;
  Username: string;
  FirstName: string;
  LastName: string;
}

export interface PostMedia {
  media_id: number;
  post_id: number;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
}

export interface Post {
  ID: number;
  content: string;
  userId: number;
  placeId: number;
  earnedPoints: number;
  createdAt: string;
  user: User;
  postMedia: PostMedia[];
}

export interface PlaceDetails extends BasePlace {
  posts: Post[];
}

// Type guard to check if a place is PlaceDetails
export function isPlaceDetails(place: BasePlace | PlaceDetails): place is PlaceDetails {
  return 'posts' in place;
}

import { ObjectId } from "mongodb";

export interface FavoriteShow {
  showId: number;
  dateAdded: Date;
}

export type CognitoUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export interface FavoriteItem {
  showId: number;
  dateAdded: Date;
}

export interface UserFavorites {
  _id?: ObjectId;
  userId: string;
  favorites: FavoriteItem[];
}

export interface FormattedEpisode {
  id: number;
  name: string;
  overview: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string | null;
  stillPath: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface FormattedShow {
  id: number;
  voteCount: number;
  voteAverage: number;
  posterPath: string;
  popularity: number;
  overview: string;
  name: string;
  firstAirDate: string;
  numberOfSeasons: number;
}

import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import dotenv from "dotenv";
import { getUser } from "../../utils/events";
import { MongoClient } from "mongodb";
import { MovieDb } from "moviedb-promise";
import { POSTER_PATH_PREFIX } from "../../utils/constants";
import {
  sendInternalServerError,
  sendOkResponse,
  sendUnauthorizedError,
} from "../../utils/responses";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL as string);
const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const user = getUser(event);
    console.log(user.id);

    if (!user?.id) {
      return sendUnauthorizedError();
    }

    await client.connect();
    const database = client.db("tvShowApp");
    const favorites = database.collection("favorites");

    const results = await favorites.findOne({ userId: user.id });

    const favoritesWithMetaData = [];

    // Apply pagination eventually
    if (results && results.favorites) {
      for (let fav of results.favorites) {
        const show = await moviedb.tvInfo({ id: fav.showId });
        favoritesWithMetaData.push({
          id: show.id,
          voteCount: show.vote_count,
          voteAverage: show.vote_average,
          posterPath: show.poster_path
            ? `${POSTER_PATH_PREFIX}${show.poster_path}`
            : null,
          popularity: show.popularity,
          overview: show.overview,
          name: show.name,
          isFavorite: true,
        });
      }
    }

    return sendOkResponse({ shows: favoritesWithMetaData });
  } catch (error) {
    console.error(error);
    return sendInternalServerError(
      "An error occurred while fetching trending TV shows"
    );
  }
};

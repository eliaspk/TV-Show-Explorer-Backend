import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import { MovieDb } from "moviedb-promise";
import dotenv from "dotenv";
import { POSTER_PATH_PREFIX } from "../../utils/constants";
import { getUser } from "../../utils/events";
import { MongoClient } from "mongodb";
import {
  sendInternalServerError,
  sendOkResponse,
  sendUnauthorizedError,
} from "../../utils/responses";

dotenv.config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);
const mongoClient = new MongoClient(process.env.MONGO_URL as string);

export const handler: Handler = async (
  event: APIGatewayProxyEvent | APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const isAuthenticated =
      getUser(event as APIGatewayProxyWithCognitoAuthorizerEvent)?.id ?? false;
    let favoriteShowIds: number[] = [];

    if (isAuthenticated) {
      const user = getUser(event as APIGatewayProxyWithCognitoAuthorizerEvent);
      if (!user?.id) {
        return sendUnauthorizedError();
      }

      await mongoClient.connect();
      const database = mongoClient.db("tvShowApp");
      const favoritesCollection = database.collection("favorites");
      const userFavorites = await favoritesCollection.findOne({
        userId: user.id,
      });
      favoriteShowIds =
        userFavorites?.favorites.map((fav: { showId: number }) => fav.showId) ||
        [];
    }

    const res = await moviedb.discoverTv({
      sort_by: "popularity.desc",
    });

    const body = {
      page: res.page,
      results: res.results
        ?.filter(
          (show) => show.first_air_date !== "" && show.poster_path !== null
        )
        .map(
          ({
            id,
            vote_count,
            vote_average,
            poster_path,
            popularity,
            overview,
            name,
            first_air_date,
          }) => ({
            id,
            voteCount: vote_count,
            voteAverage: vote_average,
            posterPath: poster_path
              ? `${POSTER_PATH_PREFIX}${poster_path}`
              : null,
            popularity,
            overview,
            name,
            firstAirDate: first_air_date,
            isFavorite:
              isAuthenticated && id ? favoriteShowIds.includes(id) : false,
          })
        ),
    };

    return sendOkResponse(body);
  } catch (error) {
    console.error(error);
    return sendInternalServerError(
      "An error occurred while fetching trending TV show"
    );
  }
};

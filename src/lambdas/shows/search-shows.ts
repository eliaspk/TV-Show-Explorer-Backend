import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import { POSTER_PATH_PREFIX } from "../../utils/constants";
import { MovieDb } from "moviedb-promise";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { getQueryStringParameters, getUser } from "../../utils/events";
import {
  sendInternalServerError,
  sendOkResponse,
  sendUnauthorizedError,
} from "../../utils/responses";

dotenv.config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);
const mongoClient = new MongoClient(process.env.MONGO_URL as string);

type QueryStringParameters = {
  searchQuery: string;
};

export const handler: Handler = async (
  event: APIGatewayProxyEvent | APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { searchQuery } = getQueryStringParameters(
    event
  ) as QueryStringParameters;

  try {
    const isAuthenticated =
      getUser(event as APIGatewayProxyWithCognitoAuthorizerEvent)?.id ?? false;
    let favoriteShowIds: number[] = [];

    if (isAuthenticated) {
      const user = getUser(event as APIGatewayProxyWithCognitoAuthorizerEvent);
      if (!user?.id) {
        sendUnauthorizedError();
      }

      // Connect to MongoDB and get user favorites
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

    const res = await moviedb.searchTv({
      query: searchQuery,
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
          }) => {
            return {
              id,
              voteCount: vote_count,
              voteAverage: vote_average,
              posterPath: `${POSTER_PATH_PREFIX}${poster_path}`,
              popularity,
              overview,
              name,
              isFavorite:
                isAuthenticated && id ? favoriteShowIds.includes(id) : false,
            };
          }
        ),
    };

    return sendOkResponse(body);
  } catch (error) {
    console.log(error);
    return sendInternalServerError("Error occured searching for shows");
  }
};

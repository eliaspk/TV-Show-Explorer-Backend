import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { MovieDb, ShowResponse } from "moviedb-promise";
import dotenv from "dotenv";
import { POSTER_PATH_PREFIX } from "../../utils/constants";
import {
  sendBadRequestError,
  sendInternalServerError,
  sendOkResponse,
} from "../../utils/responses";
import { FormattedShow } from "../../types";

dotenv.config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);

async function getShowDetails(showId: string): Promise<FormattedShow> {
  const showDetails: ShowResponse = await moviedb.tvInfo({ id: showId });

  return {
    id: showDetails.id || 0,
    voteCount: showDetails.vote_count || 0,
    voteAverage: showDetails.vote_average || 0,
    posterPath: showDetails.poster_path
      ? `${POSTER_PATH_PREFIX}${showDetails.poster_path}`
      : "",
    popularity: showDetails.popularity || 0,
    overview: showDetails.overview || "",
    name: showDetails.name || "",
    firstAirDate: showDetails.first_air_date || "",
    numberOfSeasons: showDetails.number_of_seasons || 0,
  };
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { id } = event.pathParameters as { id: string };

  if (!id) {
    return sendBadRequestError("Missing show id");
  }

  try {
    const showDetails = await getShowDetails(id);
    return sendOkResponse(showDetails);
  } catch (error) {
    console.error(error);
    return sendInternalServerError("Error getting show details");
  }
};

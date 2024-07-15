import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { MovieDb, ShowResponse } from "moviedb-promise";
import dotenv from "dotenv";
import {
  sendBadRequestError,
  sendInternalServerError,
  sendOkResponse,
} from "../../utils/responses";

dotenv.config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);

interface FormattedSeason {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
}

async function getShowSeasons(showId: string): Promise<FormattedSeason[]> {
  const showDetails: ShowResponse = await moviedb.tvInfo({ id: showId });

  return (showDetails.seasons || [])
    .filter(
      (season) =>
        season.name &&
        season.name.toLowerCase() !== "n/a" &&
        season.season_number !== 0
    )
    .map((season) => ({
      id: season.id || 0,
      name: season.name || "",
      seasonNumber: season.season_number || 0,
      episodeCount: season.episode_count || 0,
    }));
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { id } = event.pathParameters as { id: string };

  if (!id) {
    return sendBadRequestError("Missing show id");
  }

  try {
    const seasons = await getShowSeasons(id);

    return sendOkResponse(seasons);
  } catch (error) {
    console.error(error);
    return sendInternalServerError("Error getting seasons");
  }
};

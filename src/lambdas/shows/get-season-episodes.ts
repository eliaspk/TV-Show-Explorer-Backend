import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { MovieDb, TvSeasonResponse } from "moviedb-promise";
import { parseISO, isBefore } from "date-fns";
import dotenv from "dotenv";
import { POSTER_PATH_PREFIX } from "../../utils/constants";
import {
  sendBadRequestError,
  sendInternalServerError,
  sendOkResponse,
} from "../../utils/responses";
import { FormattedEpisode } from "../../types";

dotenv.config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY as string);

async function getSeasonEpisodes(
  showId: string,
  seasonNumber: number,
  minRating: number
): Promise<FormattedEpisode[]> {
  const seasonDetails: TvSeasonResponse = await moviedb.seasonInfo({
    id: showId,
    season_number: seasonNumber,
  });

  const currentDate = new Date();

  const filteredEpisodes = (seasonDetails.episodes || [])
    .filter(
      (episode) =>
        episode.name &&
        episode.name.toLowerCase() !== "n/a" &&
        episode.air_date &&
        isBefore(parseISO(episode.air_date), currentDate) &&
        (episode.vote_average || 0) >= minRating
    )
    .map((episode) => ({
      id: episode.id || 0,
      name: episode.name || "",
      overview: episode.overview || "",
      seasonNumber: episode.season_number || 0,
      episodeNumber: episode.episode_number || 0,
      airDate: episode.air_date || null,
      stillPath: episode.still_path
        ? `${POSTER_PATH_PREFIX}${episode.still_path}`
        : null,
      voteAverage: episode.vote_average || 0,
      voteCount: episode.vote_count || 0,
    }));

  return filteredEpisodes;
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { id: showId, seasonNumber } = event.pathParameters as {
    id: string;
    seasonNumber: string;
  };
  const { minRating = "0" } = event.queryStringParameters || {};

  if (!showId || !seasonNumber) {
    return sendBadRequestError("Missing showId or season number");
  }

  try {
    const episodes = await getSeasonEpisodes(
      showId,
      parseInt(seasonNumber),
      parseFloat(minRating)
    );

    return sendOkResponse(episodes);
  } catch (error) {
    console.error(error);
    return sendInternalServerError(
      "An error occurred while fetching season episodes"
    );
  }
};

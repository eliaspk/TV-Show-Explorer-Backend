import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import dotenv from "dotenv";
import { getPathParameters, getUser } from "../../utils/events";
import { MongoClient } from "mongodb";
import { UserFavorites } from "../../types";
import {
  sendBadRequestError,
  sendInternalServerError,
  sendNoContentResponse,
  sendNotFoundError,
  sendUnauthorizedError,
} from "../../utils/responses";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL as string);

type PathParameters = {
  id: number;
};

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const user = getUser(event);
    const { id: showId } = getPathParameters(event) as PathParameters;

    if (!user?.id) {
      return sendUnauthorizedError();
    }

    if (!showId) {
      return sendBadRequestError("ShowId not provided");
    }

    await client.connect();
    const database = client.db("tvShowApp");
    const favorites = database.collection<UserFavorites>("favorites");

    const result = await favorites.updateOne(
      { userId: user.id },
      {
        $pull: { favorites: { showId: showId } },
      }
    );

    if (result.modifiedCount === 0) {
      return sendNotFoundError("Show not in favorites");
    }

    return sendNoContentResponse();
  } catch (error) {
    console.error(error);
    return sendInternalServerError("Error removing favorite");
  }
};

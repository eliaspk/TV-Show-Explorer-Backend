import type {
  APIGatewayProxyStructuredResultV2,
  Handler,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import dotenv from "dotenv";
import { getBody, getUser } from "../../utils/events";
import { MongoClient, ObjectId } from "mongodb";
import { FavoriteItem, UserFavorites } from "../../types";
import {
  sendBadRequestError,
  sendInternalServerError,
  sendNoContentResponse,
  sendUnauthorizedError,
} from "../../utils/responses";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL as string);

type Body = {
  showId: number;
};

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const user = getUser(event);
    const body = getBody(event) as Body;

    if (!user?.id) {
      return sendUnauthorizedError();
    }

    await client.connect();
    const database = client.db("tvShowApp");
    const favorites = database.collection<UserFavorites>("favorites");

    // Check if the show is already in favorites
    const existingFavorite = await favorites.findOne({
      userId: user.id,
      "favorites.showId": body.showId,
    });

    if (existingFavorite) {
      return sendBadRequestError("Show already in favorites");
    }

    // If not in favorites, add it
    const updateResult = await favorites.updateOne(
      { userId: user.id },
      {
        $push: {
          favorites: {
            showId: body.showId,
            dateAdded: new Date(),
          } as FavoriteItem,
        },
      },
      { upsert: true }
    );

    if (updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0) {
      return sendInternalServerError("Error adding favorite");
    }

    return sendNoContentResponse();
  } catch (error) {
    console.error(error);
    return sendInternalServerError("Error adding favorite");
  } finally {
    await client.close();
  }
};

import {
  APIGatewayProxyEvent,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import { CognitoUser } from "../types";

export const getBody = <BodyType extends object>(
  event: APIGatewayProxyEvent
): BodyType | undefined =>
  event?.body ? (JSON.parse(event.body) as BodyType) : undefined;

export const getPathParameters = <ParameterType extends object>(
  event: APIGatewayProxyEvent
): ParameterType | undefined =>
  event?.pathParameters ? (event.pathParameters as ParameterType) : undefined;

export const getQueryStringParameters = <ParameterType extends object>(
  event: APIGatewayProxyEvent
): ParameterType | undefined =>
  event?.queryStringParameters
    ? (event.queryStringParameters as ParameterType)
    : undefined;

export const getUser = (
  event: APIGatewayProxyWithCognitoAuthorizerEvent
): CognitoUser => {
  return {
    id: event?.requestContext?.authorizer?.claims?.sub,
    name: event?.requestContext?.authorizer?.claims?.name,
    picture: event?.requestContext?.authorizer?.claims?.picture,
    email: event?.requestContext?.authorizer?.claims?.email,
  };
};

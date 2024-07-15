import { APIGatewayProxyResult } from "aws-lambda";

export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// Update to not use wild card
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const createResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify(body),
  headers: CORS_HEADERS,
});

export const sendSuccessResponse = <T>(
  statusCode: HTTP_STATUS,
  data: T
): APIGatewayProxyResult => createResponse(statusCode, data);

export const sendOkResponse = <T>(data: T): APIGatewayProxyResult =>
  sendSuccessResponse(HTTP_STATUS.OK, data);

export const sendCreatedResponse = <T>(data: T): APIGatewayProxyResult =>
  sendSuccessResponse(HTTP_STATUS.CREATED, data);

export const sendNoContentResponse = (): APIGatewayProxyResult => ({
  statusCode: HTTP_STATUS.NO_CONTENT,
  body: "",
  headers: CORS_HEADERS,
});

export const sendErrorResponse = (
  statusCode: HTTP_STATUS,
  message: string
): APIGatewayProxyResult => createResponse(statusCode, { error: message });

export const sendBadRequestError = (message: string): APIGatewayProxyResult =>
  sendErrorResponse(HTTP_STATUS.BAD_REQUEST, message);

export const sendUnauthorizedError = (
  message: string = "Unauthorized action"
): APIGatewayProxyResult =>
  sendErrorResponse(HTTP_STATUS.UNAUTHORIZED, message);

export const sendNotFoundError = (message: string): APIGatewayProxyResult =>
  sendErrorResponse(HTTP_STATUS.NOT_FOUND, message);

export const sendConflictError = (message: string): APIGatewayProxyResult =>
  sendErrorResponse(HTTP_STATUS.CONFLICT, message);

export const sendInternalServerError = (
  message: string = "An internal server error occurred"
): APIGatewayProxyResult =>
  sendErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);

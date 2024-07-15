# TV Show Explorer Backend

## Overview

This is the backend for the TV Show Explorer application, which allows users to discover, search, and manage their favorite TV shows. It provides API endpoints for fetching show details, managing user favorites, and handling user authentication.

## Technologies Used

- Node.js
- TypeScript
- AWS Lambda
- Amazon API Gateway
- Amazon Cognito (for authentication)
- MongoDB (for storing user favorites)

## Prerequisites

- Node.js (version 20.13.1)
- MongoDB instance (local or cloud-based)
- AWS Credentials

## Setup

1. Clone the repository:

   ```
   git clone [Your repository URL]
   cd [Your project directory]
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   MONGODB_URI=your_mongodb_connection_string
   MOVIEDB_API_KEY=your_moviedb_api_key
   AWS_REGION=your_aws_region
   COGNITO_USER_POOL_ID=your_cognito_user_pool_id
   COGNITO_CLIENT_ID=your_cognito_client_id
   ```

4. [Any additional setup steps]

## Deployment

This project uses the Serverless Framework for deployment to AWS Lambda.

1. Install the Serverless Framework globally:

   ```
   npm install -g serverless
   ```

2. Deploy the application:
   ```
   serverless deploy --dev
   ```

## API Endpoints

### Public Endpoints

- `GET /api/shows/discover`: Discover popular TV shows
- `GET /api/shows`: Search for TV shows
- `GET /api/shows/{id}`: Get details of a specific TV show
- `GET /api/shows/{id}/seasons`: Get seasons of a specific TV show
- `GET /api/shows/{showId}/seasons/{seasonNumber}/episodes`: Get episodes of a specific season

### Protected Endpoints (require authentication)

- `POST /api/favorites`: Add a show to user's favorites
- `DELETE /api/favorites/{id}`: Remove a show from user's favorites
- `GET /api/favorites`: Get user's favorite shows

## Authentication

This application uses Amazon Cognito for user authentication. Feel free to use any random email, there's no email validation.

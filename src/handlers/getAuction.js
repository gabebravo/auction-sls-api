import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters; // get param value from route

  try {
    const result = await dynamoDb
      .get({
        // get = query method
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id }, // the Key = the thing you want to search by
      })
      .promise();
    auction = result.Item; // result = single item for the get method
  } catch (error) {
    console.log('error', error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

// Apply Middy middlware functions
export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());

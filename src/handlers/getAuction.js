import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddy from '../utils/commonMiddy';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

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

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters; // get param value from route
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

// Apply Middy middlware functions
export const handler = commonMiddy(getAuction);

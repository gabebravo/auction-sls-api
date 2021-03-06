import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddy from '../utils/commonMiddy';
import { getAuctionById } from './getAuction';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters; // get param value from route
  const { amount } = event.body; // get value from PATCH body

  const auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be hire than ${auction.highestBid.amount}`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount', // get highestBid.amount in auction obj and set to amount from route
    ExpressionAttributeValues: {
      // how dynamoDb gets amount from the route above and sets it
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW', // tells dynamoDb what to return once the operation is complete
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes; // Attributes = returns all attributes from the auction just updated
  } catch (error) {
    console.log('error', error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

// Apply Middy middlware functions
export const handler = commonMiddy(placeBid);

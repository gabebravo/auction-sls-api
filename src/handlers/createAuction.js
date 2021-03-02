import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddy from '../utils/commonMiddy';
import createError from 'http-errors';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
  };

  // chaining .promise makes any aws opreation async/await in nature
  try {
    await dynamoDb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    // declarative error handling w/ createError
    console.log('error', error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

// Apply Middy middlware functions
export const handler = commonMiddy(createAuction);

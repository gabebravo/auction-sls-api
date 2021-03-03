import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddy from '../utils/commonMiddy';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  // chaining .promise makes any aws opreation async/await in nature
  try {
    const result = await dynamoDb
      .scan({ TableName: process.env.AUCTIONS_TABLE_NAME })
      .promise();
    auctions = result.Items;
  } catch (error) {
    console.log('error', error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

// Apply Middy middlware functions
export const handler = commonMiddy(getAuctions);

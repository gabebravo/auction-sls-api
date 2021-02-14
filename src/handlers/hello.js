async function hello(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Gabe SLS test!',
    }),
  };giot
}

export const handler = hello;

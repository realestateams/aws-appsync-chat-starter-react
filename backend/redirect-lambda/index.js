exports.handler = async (event, context) => {
    console.log('redirect-lambda', event, context)
    const response = {
        statusCode: 301,
        headers: {
            Location: 'https://google.com'
        }
    };
    
    return response;
};
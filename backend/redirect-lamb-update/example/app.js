const graphQLSchema = require('../lib');
const fs = require('fs');

const pathToSwaggerSchema = `${__dirname}/../../serverless/swaggerdoc.yaml`;

graphQLSchema(pathToSwaggerSchema)
  .then(schema => {
    console.log('finished schema generation', schema)
    fs.readFile(`${__dirname}/../../serverless/redirect-lambda/template.js`, 'utf8', function (err, data) {
      if (err) throw err;
      data = data.replace('$QUERIES_AND_MUTATIONS', JSON.stringify(schema));
      //Do your processing, MD5, send a satellite to the moon, etc.
      fs.writeFile (`${__dirname}/../../serverless/redirect-lambda/index.js`, data, function(err) {
          if (err) throw err;
          console.log('complete');
      });
    });
  })
  .catch(e => {
    console.log(e);
  });

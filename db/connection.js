const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'authDb';

async function connectToDb() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const userCollection = db.collection('users');

  // the following code examples can be pasted here...

  return userCollection;
}

module.exports = connectToDb
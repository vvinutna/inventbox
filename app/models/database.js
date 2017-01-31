const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE users(u_id SERIAL PRIMARY KEY, email VARCHAR(40) not null, password CHAR(60) not null)');
query.on('end', () => { client.end(); });
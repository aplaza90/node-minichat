import pkg from 'pg'
const { Pool } = pkg

const databaseUrl = process.env.DATABASE_URL 

export class PostgresController {
  constructor ({databaseUrl}) {
    this.pool = new Pool({
      connectionString: databaseUrl,
    })

    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    }) 
  }

  createTable = async () => {
    const client = await this.pool.connect()
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          content TEXT,
          username TEXT,
          datetime TEXT
        )
      `)
      console.log("Table 'messages' created or already exists in postgres.")
    } catch (err) {
      console.log("error creating the table in postgres")
    } finally {
      client.release();
    }
  }
insertMessage = async (msg, username, datetime) => {
  const client = await this.pool.connect()
  let result;

  try {
    const query = `
      INSERT INTO messages (content, username, datetime) 
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [msg, username, datetime];

    result = await client.query(query, values);
    console.log('Message inserted:', result.rows[0]);
  } catch (err) {
    console.error('Error inserting message:', err);
  } finally {
    client.release();
  }

  return result;
}

fetchMessages = async (offset) => {
  const client = await this.pool.connect()
  let result;

  try {
    const query = `
      SELECT id, content, username, datetime 
      FROM messages 
      WHERE id > $1;
    `;
    const values = [offset];

    result = await client.query(query, values);
    return result.rows; // Return the rows directly
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  } finally {
    client.release();
  }
}

}



import express, { query } from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import {createServer} from 'node:http'

import { getConnection } from './db.js'

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

const createTable = async () => {
  const client = await getConnection()
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

const insertMessage = async (msg, username, datetime) => {
  const client = await getConnection();
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

const fetchMessages = async (offset) => {
  const client = await getConnection();
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

createTable()

io.on('connection', async (socket) => {
  console.log('New user connected')

  socket.on('disconnect', () => {
    console.log("User disconnected")
  })

  socket.on('chat message', async (msg) => {
    let result
    const username = socket.handshake.auth.username ?? 'anonymous' 
    const datetime = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
  })
    try {
      result = await insertMessage(msg, username, datetime)
    } catch (e) {
      console.log('------an error happened-----')
      console.error(e)
      return
    }

    io.emit('chat message', msg, result.rows[0].id.toString(), username, datetime)
  })

  if (!socket.recovered) {
    try {
      const serverOffset = socket.handshake.auth.serverOffset ?? 0
      const messages = await fetchMessages(serverOffset)

      messages.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.username, row.datetime)
      })
    } catch (e) {
      console.error(e)
    }
  }
})

app.use(logger('dev'))

app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, ()=>{
    console.log(`Server listening succesfully on port ${port}`)
})


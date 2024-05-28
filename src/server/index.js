import express, { query } from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import {createServer} from 'node:http'
import dotenv from 'dotenv'
import { createClient } from '@libsql/client'

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

const db = createClient({
    url: "libsql://engaging-phantom-aplaza90.turso.io",
    authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    user TEXT, 
    datetime TEXT
  )
`)

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
      result = await db.execute({
        sql: 'INSERT INTO messages (content, user, datetime) VALUES (:msg, :username, :datetime)',
        args: { msg, username, datetime}
      })
    } catch (e) {
      console.log('------an error happened-----')
      console.error(e)
      return
    }

    io.emit('chat message', msg, result.lastInsertRowid.toString(), username, datetime)
  })

  if (!socket.recovered) {
    try {
      const results = await db.execute({
        sql: 'SELECT id, content, user, datetime FROM messages WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0]
      })

      results.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.user, row.datetime)
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


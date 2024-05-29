import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import {createServer} from 'node:http'


export const createChat = ({ dbController }) => {
    const app = express()
    const server = createServer(app)
    const io = new Server(server, {
      connectionStateRecovery: {}
    })
  
    dbController.createTable()
  
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
          result = await dbController.insertMessage(msg, username, datetime)
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
          const messages = await dbController.fetchMessages(serverOffset)
  
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
    
    const port = process.env.PORT ?? 3000
    server.listen(port, ()=>{
        console.log(`Server listening succesfully on port ${port}`)
    })
}
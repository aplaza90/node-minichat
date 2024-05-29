import { PostgresController } from './postgres/db.js'
import { createChat } from './chat.js'

const port = process.env.PORT ?? 3000
const databaseUrl = process.env.DATABASE_URL
const db = new PostgresController({databaseUrl})

createChat({dbController: db})

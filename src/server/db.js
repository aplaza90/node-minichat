import pkg from 'pg'
const { Pool } = pkg

const databaseUrl = process.env.DATABASE_URL 

const pool = new Pool({
    connectionString: databaseUrl,
  })


pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})  

export const getConnection = async () => {
    const client = await pool.connect()
    return client
}


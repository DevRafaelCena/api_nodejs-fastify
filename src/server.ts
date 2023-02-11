import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/', async (request, reply) => {
  const tables = await knex('sqlite_schema').select('*')
  console.log(tables)
  return { hello: 'world' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
  }
  console.log(`server listening on e ${address}`)
})

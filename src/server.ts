import fastify from 'fastify'
import { knex } from './database'
import crypto from 'crypto'

const app = fastify()

app.get('/', async (request, reply) => {
  const transactions = await knex('transations')
    .insert({
      id: crypto.randomUUID(),
      title: 'test',
      amount: 100,
    })
    .returning('*')

  console.log(transactions)
  return { hello: 'world' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
  }
  console.log(`server listening on e ${address}`)
})

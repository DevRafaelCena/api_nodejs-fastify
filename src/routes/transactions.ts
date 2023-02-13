import { knex } from '../database'
import crypto from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    console.log('hook global')
  })

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionID = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where({ session_id: sessionID })
        .select('*')
      return reply.status(200).send({ transactions })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const sessionID = request.cookies.sessionId

      const transaction = await knex('transactions')
        .where({ id, session_id: sessionID })
        .first()

      if (!transaction) {
        return reply.status(404).send()
      }

      return reply.status(200).send({ transaction })
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionID = request.cookies.sessionId

      const summary = await knex('transactions')
        .where('session_id', sessionID)
        .sum('amount as total')
        .first()

      return reply.status(200).send({ summary })
    },
  )

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })

      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = crypto.randomBytes(16).toString('hex')
        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      }

      await knex('transactions').insert({
        id: crypto.randomBytes(16).toString('hex'),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )
}

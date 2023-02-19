import { env } from './env'
import { app } from './app'

app.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
  }
  console.log(`server listening on e ${address}`)
})

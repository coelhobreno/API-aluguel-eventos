import { fastify } from 'fastify'
import { DataBasePostgres } from './database.postgres.js'

const server = fastify()

const database = new DataBasePostgres()

//CONFIG CORS
server.addHook('onRequest', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  done();
});

//GET PRODUCTS
server.get('/products', async(request, reply) => {

    const search = request.query.search
    
    const products = await database.list(search)

    return products

})

//POST PRODUCTS
server.post('/products', async(request, reply) => {

    const body = request.body

    const { name, description, price, image } = body

    await database.create({
        name,
        description,
        price,
        image
    }, "products")

    return reply.status(201).send()
    
})

//DELETES
server.delete('/products/:id', async(request, reply) => {

    const productId = request.params.id

    await database.delete(productId)

    return reply.status(204).send()

})

server.listen({
    host: "0.0.0.0",
    port: process.env.PORT ?? 3333
})
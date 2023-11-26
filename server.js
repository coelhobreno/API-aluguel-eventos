import { fastify } from 'fastify'
import { DataBasePostgres } from './database.postgres.js'

//IMPORT CORS
import cors from 'cors';

const server = fastify()

const database = new DataBasePostgres()

//CONFIG CORS
server.use(cors())

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
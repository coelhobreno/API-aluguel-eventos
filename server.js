import { DataBaseMemory } from "./database-postgres.js";

import fastify from "fastify";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const server = fastify()
const database = new DataBaseMemory()

//CONFIG CORS
server.addHook('onRequest', async (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  done();
});

//PRODUCTS
server.get('/products', async(request) => {
    const search = request.query.search

    const products = await database.listProducts(search)

    return products
})

server.post('/products', async (request, reply) => {
    const body = request.body

    const { title, description } = body

    await database.createProduct({
        title,
        description
    })

    return reply.status(201).send()
})

server.put('/products/:id', async (request, reply) => {
    const id = request.params.id
    const body = request.body

    await database.updateProduct(id, body)

    return reply.status(200).send()
})

server.delete('/products/:id', async (request, reply) => {
    const id = request.params.id

    await database.deleteProduct(id)

    return reply.status(200).send()
})


//USERS
server.post('/register', async(request, reply) => {
    try {
        const { email, password, name, surname } = request.body

        //Verificar se o email já está cadastrado
        const existingUser = await database.listUser(email)
        if(existingUser.length > 0){
            
            return reply.status(400).send({
                message: 'Este email já está cadastrado.'
            })
            
        }

        //Gerando salt para usar na geração do hash (Ou seja, uma sequencia de caracteres aleatórios que é adicionado a senha antes de ser criptografado)
        const saltRounds = 10; //Definindo 10 caractecteres aleatórios
        const salt = await bcrypt.genSalt(saltRounds)
        

        //Gerar o hash da senha utilizando o salt
        const hashedPassword = await bcrypt.hash(password, salt);

        //Se este email não estiver cadastrado, pode-se prosseguir
        //Criando usuário
        await database.createUser({
            email, 
            password: hashedPassword, 
            name, 
            surname
        })

        return reply.status(201).send({
            message: "Usuário registrado com sucesso.",
        })

    }catch(error){
        return reply.status(500).send({ 
            message: 'Erro interno do servidor ao registrar o usuário' 
        });
    }
})

server.post('/login', async(request, reply) => {
    
    const { email, password } = request.body

    //verificar se o usuário existe no banco
    const user = await database.listUser(email)
    if(!user){
        return reply.status(401).send({
            message: "Credenciais Inválidas"
        })
    }

    //comparar a senha fornecida com a senha armazenada
    const isPasswordValid = await bcrypt.compare(password, user[0].password)
    if(!isPasswordValid) {
        return reply.status(401).send({
            message: "Credenciais Inválidas"
        })
    }
    
    //gerar token
    const token = jwt.sign({ id: user.id, email }, 'Verdaomago15@')

    //retornar token e usuario
    return reply.status(201).send({ 
        user,
        token
    })

})

//CARTS
// server.post('/carts/:id', async(request, reply) => {

// })

server.listen({
    host: "0.0.0.0",
    port: process.env.PORT ?? 3333

 })
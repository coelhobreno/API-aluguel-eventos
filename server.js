import { DataBaseMemory } from "./database-postgres.js";

import fastify from "fastify";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const server = fastify()
const database = new DataBaseMemory()

//CONFIG CORS
server.addHook('onRequest', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  done();
});

//CONFIG CORS FROM /LOGIN
server.options('/users/login', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  reply.send();
});

//CONFIG CORS FROM /REGISTER
server.options('/users/register', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  reply.send();
});

//CONFIG CORS /CARTS/ITEMS
// server.route({
//   method: 'OPTIONS',
//   url: '/carts/items',
//   handler: (req, reply) => {
//     reply
//       .header('Access-Control-Allow-Origin', '*')
//       .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//       .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//       .send();
//   }
// });

server.options('/carts/items', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  reply.send();
});

server.options('/carts/items/:id', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  reply.send();
});

server.options('/verify-user', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  reply.send();
});





//VERIFY TOKEN
server.post('/verify-user', (req, res) => {
    try{
        const token = req.body
        
        const decoded = jwt.verify(token, 'Verdaomago15@')
        res.status(200).send({ valid: true, decoded });
    }catch(err){
        res.status(401).send({ valid: false, message: 'Token inválido' });
    }
})

server.get('/verify-user', (req, res) => {
    res.send('Backend is acessible!')
})





//PRODUCTS
server.get('/products', async(request) => {
    const search = request.query.search

    const products = await database.listProducts(search)

    return products
})

server.post('/products', async (request, reply) => {
    const body = request.body

    await database.createProduct(body)

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
server.post('/users/register', async(request, reply) => {
    try {
        const { name, surname, email, password } = request.body

        //Verificar se o email já está cadastrado
        const existingUser = await database.listUser(email)
        if(existingUser.length > 0){
            return reply.status(400).send({
                message: 'Este email já está cadastrado.'
            })
        }
        //Se o email não estiver cadastrado...

        //Gerando salt para usar na geração do hash (Ou seja, uma sequencia de caracteres aleatórios que é adicionado a senha antes de ser criptografado)
        const saltRounds = 10; //Definindo 10 caractecteres aleatórios
        const salt = await bcrypt.genSalt(saltRounds)
        

        //Gerar o hash da senha utilizando o salt
        const hashedPassword = await bcrypt.hash(password, salt);

        //Criando usuário
        await database.createUser({
            name,
            surname,
            email, 
            password: hashedPassword
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

server.post('/users/login', async(request, reply) => {
    try{
        const { email, password } = request.body

        //verificar se o usuário existe no banco
        const user = await database.listUser(email)
        if(!user){
            return reply.status(401).send({
                message: "Credenciais Inválidas. Verifique seu email."
            })
        }

        //comparar a senha fornecida com a senha armazenada
        const isPasswordValid = await bcrypt.compare(password, user[0].password)
        if(!isPasswordValid){
            return reply.status(401).send({
                message: "Credenciais Inválidas. Verifique sua senha."
            })
        }
        
        //gerar token
        const expiresIn = '7d'
        const token = jwt.sign({ id: user[0].id, email }, 'Verdaomago15@', { expiresIn })

        //retirando senha do usuário
        const { password: authorize, ...rest } = user[0]

        //retornar token e usuario
        return reply.status(201).send({
            user: rest,
            token
        })
    }catch(err){
        return reply.status(500).send({ 
            message: 'Erro interno do servidor autenticar o usuário' 
        });
    }

})

//DELETE USER
server.delete('/users/:id', async(request, reply) => {
    const userId = request.params.id
    if(!userId){
        return reply.status(401).send({
            message: "Usuário não identificado!"
        })
    }

    await database.deleteUser(userId)

    return reply.status(200).send({
        message: "Usuário removido!"
    })
})





//ITEMS_CART
server.post('/carts/items', async(request, reply) => {
    try{
        const body = request.body

        await database.createItemCart(body)

        return reply.status(201).send({
            message: "Item adicionado ao carrinho."
        })
    }catch(err){
        return reply.status(401).send({
            message: "O produto não foi adicionado ao carrinho."
        })
    }
})

server.delete('/carts/items', async(request, reply) => {
    try{
        await database.clearCart()

        return reply.status(200).send({
            message: "Itens removidos do carrinho."
        })
    }catch(err){
        return reply.status(401).send({
            message: "O carrinho não foi limpo."
        })
    }
})

//Itens de um carrinho específico
server.get('/carts/items/:id', async(request, reply) => {
    const userId = request.params.id

    const itemsInCart = await database.listItensCart(userId)

    return reply.status(201).send(itemsInCart)
})

//Deletar item
server.delete('/carts/items/:id', async(request, reply) => {
    try{

        const itemId = request.params.id

        await database.deleteItemCart(itemId)

        return reply.status(200).send({
            message: "Item removido do carrinho."
        })

    }catch(err){
        return reply.status(401).send({
            message: "O produto não foi removido do carrinho."
        })
    }
})


server.listen({
    host: "0.0.0.0",
    port: process.env.PORT ?? 3333
 })
import { randomUUID } from 'crypto'

import { sql } from './db.js'

export class DataBaseMemory {

    //PRODUCTS
    async listProducts(search) {
        
        if(search){

            const searchTerms = search.split(' ')

            //É preciso utilizar o sql``. Se você passar uma string pura (sem usar a função sql), o executor SQL pode interpretá-la como uma consulta direta sem tratamento especial para parâmetros. Isso pode resultar em um erro, especialmente se a string contiver caracteres especiais que precisam ser escapados, ou se a consulta não estiver de acordo com a sintaxe esperada pelo banco de dados.
            const query = sql`
            SELECT * FROM products
            WHERE description ILIKE ANY(${searchTerms.map(term => '%' + term + '%')})
            `;

            return await sql`${query}`

        }

        return await sql`SELECT * FROM products`

    }

    async createProduct(product){

        const productId = randomUUID()

        const { title, description, image, price } = product

        await sql`insert into products (id, title, description, image, price) values (${productId}, ${title}, ${description}, ${image}, ${price})`

    }

    async deleteProduct(id){
        await sql`delete from products where id = ${id}`
    }

    async updateProduct(id, product){
        const { title, description, image, price } = product

        await sql`UPDATE products 
            set title = ${title}, description = ${description}, image = ${image}, price = ${price}
            where id = ${id}
        `
    }





    //USERS
    async listUser(email) {
        const users = await sql`select * from users 
        where email = ${email}`
        
        return users
    }

    async createUser(user) {
        const { name, surname, email, password } = user

        const userId = randomUUID()

        try {

            await sql`insert into users (
                    id, name, surname, email, password
                ) VALUES (
                    ${userId}, ${name}, ${surname}, ${email}, ${password}
                );`

            await this.createCart(userId)

        }catch(err){
            return reply.status(201).send({
                message: "Erro ao cadastrar usuário"
            })
        }
    }

    async deleteUser(id) {
        await sql`delete from users
            where id = ${id}`
    }





    //CARTS
    async createCart(userId) {
        const id = randomUUID()
        
        await sql`insert into carts (id, user_id)
            values (${id}, ${userId})`
    }





    //ITEMS_CART
    async createItemCart({ productId, userId }){
        const id = randomUUID()

        const searchId = await sql`select c.id from users u 
            left join carts c on u.id = c.user_id
            where c.user_id = ${userId}`

        const cartId = searchId[0].id
        
        const isRepeatedItem = await sql`
            select qty from items_cart where product_id = ${productId} AND 
            cart_id = ${cartId}
        `
        if(isRepeatedItem.length > 0){
            const qty = isRepeatedItem[0].qty

            return await sql`
                UPDATE items_cart
                set qty = ${qty + 1}
                where product_id = ${productId} AND 
                cart_id = ${cartId}
            `
        }

        await sql`insert into items_cart (id, cart_id, product_id, qty)
            values (${id}, ${cartId}, ${productId}, 1)`
    }

    async clearCart(){
        await sql`delete from items_cart`
    }

    async deleteItemCart(itemId){
        const item = await sql`select qty from items_cart where id = ${itemId}`
        const qty = item[0].qty
        if(qty > 1){
            return await sql`UPDATE items_cart
                set qty = ${qty - 1}
                where id = ${itemId}`
        }
        
        await sql`delete from items_cart where id = ${itemId}`
    }

    //PEGAR ITENS DO CARRINHO (inner join cart and items cart)
    async listItensCart(userId){
        const searchCartId = await sql`select c.id from carts c left join users u ON c.user_id = u.id where c.user_id = ${userId}`

        const cartId = searchCartId[0].id

        const cartItems = await sql`select ic.id as item_id, * from items_cart ic left join
            products p ON ic.product_id = p.id left join
            carts c ON ic.cart_id = c.id
            where c.id = ${cartId}
        `

        return cartItems
    }
}
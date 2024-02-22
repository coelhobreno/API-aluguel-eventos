import { randomUUID } from 'crypto'

import { sql } from './db.js'

export class DataBaseMemory {

    //PRODUCTS
    async listProducts(search) {
        
        if(search){
            return await sql`select * from products where title ilike ${'%'+search+'%'}`
        }

        return await sql`select * from products`

    }

    async createProduct(product){

        const productId = randomUUID()

        const { title, description } = product

        await sql`insert into products (id, title, description) values (${productId}, ${title}, ${description})`

    }

    async deleteProduct(id){
        await sql`delete from products where id = ${id}`
    }

    async updateProduct(id, product){
        const { title, description } = product

        await sql`UPDATE products 
            set title = ${title}, description = ${description}
            where id = ${id}
        `
    }

    //CARTS
    async listCarts(search) {
        
        return await sql`select * from products p 
            inner join carts on p`

    }

    //USERS
    async listUser(email) {
        const users = await sql`select * from users 
        where email = ${email}`
        
        return users
    }

    async createUser(user) {
        const userID = randomUUID()
        const { email, password, name, surname } = user

        await sql`insert into users (
            id, email, password, name, surname
        ) VALUES (
            ${userID}, ${email}, ${password}, ${name}, ${surname}
        );`
        
    }

}
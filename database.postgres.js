import { sql } from './db.js'

import { randomUUID } from 'crypto'

export class DataBasePostgres{
    
    //Função p/ get
    async list(search){
        
        let products

        if(search){
        
            products = await sql`select * from products where name ILIKE ${'%'+search+'%'}`

        }else{

            products = await sql`select * from products`

        }

        return products

    }

    async create(product){

        const randomID = randomUUID()
            
        const { name, description, price, image } = product

        await sql`
            insert into products(id, name, description, price, image)
                VALUES(${randomID}, ${name}, ${description}, ${price}, ${image})
        `

    }

    async delete(id){

        await sql`delete from products where id = ${id}`

    }

}
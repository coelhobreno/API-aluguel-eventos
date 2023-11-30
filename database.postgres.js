import { sql } from './db.js'

import { randomUUID } from 'crypto'

export class DataBasePostgres{
    
    //Função p/ get
    async list(search){

        let products
        
        if(search){

            const searchTerms = search.split(/[+ ]/).map((term) => term.trim());
            let query = "SELECT * FROM products WHERE"
            for(let i=0 ;i < searchTerms.length; i++){
                query += `name ILIKE ${'%'+ searchTerms[i] +'%'}`
                if(i !== searchTerms.length - 1){
                query += " OR ";
                }
            }
            
            products = await sql`${query}`

        }else{

            products = await sql`SELECT * FROM products`

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
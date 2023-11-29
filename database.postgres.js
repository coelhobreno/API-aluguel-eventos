import { sql } from './db.js'

import { randomUUID } from 'crypto'

export class DataBasePostgres{
    
    //Função p/ get
    async list(search){
        
        let products

        if(search){

            const searchTerms = search.split(',').map(term => term.trim());

            const query = sql`SELECT * FROM products WHERE name ILIKE ANY(ARRAY[${searchTerms.map(term => '%' + term + '%')}])`

        
            products = await query;

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
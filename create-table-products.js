import { sql } from './db.js'

sql`
    create table products(
        id TEXT PRIMARY KEY,
        name TEXT not null,
        description TEXT not null,
        price decimal(10,2) not null,
        image TEXT
    )
`.then(() => {
    console.log('Tabela Criadaa!')
})
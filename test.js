import { sql } from './db.js'

// sql`
//     DROP TABLE users;
// `.then(() => {
//     console.log("Tabela Removida!")
// })

// PRODUCTS
// sql`
//     create table products (
//         id varchar(100) primary key,
//         title varchar(50) not null,
//         description varchar(100) not null
//     )
// `.then(() => {
//     console.log("Tabela Criada!")
// })

// USERS
sql`
    create table users (
        id varchar(100) primary key,
        email varchar(255) not null unique,
        password varchar(255) not null,
        name varchar(100) not null,
        surname varchar(100) not null
    )
`.then(() => {
    console.log("Tabela Criada!")
})
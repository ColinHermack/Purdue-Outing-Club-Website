import { NextResponse } from 'next/server';
const { Client } = require('pg');  //PostgreSQL

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
});

export async function GET(request: Request) {
    return new NextResponse("Endpoint not implemented yet.", {status: 200});
}
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

export async function GET() {
    try {
        const conn = await client.connect();
        const result = await client.query(
            `SELECT officer.position, 
                officer.officer_data,
                member.name, 
                member.email, 
                member.pronouns, 
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id`);
        return NextResponse.json(result.rows)
    } catch(error: any) {
        return new NextResponse(error, {status: 500});
    }
}
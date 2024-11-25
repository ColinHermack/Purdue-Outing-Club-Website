import { title } from "@/components/primitives";
const { Client } = require('pg');  //PostgreSQL

async function getLeaderData() {
    let client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        const result = await client.query(
            `SELECT officer.position, 
                officer.officer_data,
                member.name, 
                member.email, 
                member.pronouns, 
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id`);
        return result.rows
    } catch(error: any) {
        console.error(error);
    }
}

export default async function AboutPage() {
    const data = await getLeaderData();
    console.log(data);
    return (
        <div>
            <h1 className={title()}>Pleadership</h1>
        </div>
    );
}

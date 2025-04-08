import dotenv from "dotenv";
import {neon} from "@neondatabase/serverless";
dotenv.config();

const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env;

export const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`)

export async function getPgVersion(){
    const result = await sql `SELECt version()`;
    console.log(result[0]);
}

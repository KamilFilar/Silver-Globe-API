import mysql from 'mysql';
import dotenv from "dotenv";

dotenv.config({ path: '.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

pool.getConnection((err) => {
    if(err){
        console.log('Unable to connect to database! ');
        console.log(err);
        return;
    }
})

export default pool;
import mysql from 'mysql';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    insecureAuth: true
});

pool.getConnection((err) => {
    if(err){
        console.log('Unable to connect to database! '+err);
        return;
    }
})

module.exports = pool;
import pool from "./../config/dbConfig.js"

export default {
    
    async addEmail(req, res, next) {
        const query = "INSERT INTO `emails` (`name`, `created_at`) VALUES (?, ?);";
        pool.getConnection((err, connection) => {
            if (err) 
                throw err;
            
            const params = req.body;
            const date = new Date();

            connection.query(query, [params.email, date], (err) => {
                if (!err) {
                    return res.status(200).send(
                        `Email: ${params.email} has been added succesfull!`
                    );
                }
                else {
                    console.log(err);
                    return res.status(400).send(err);
                }
            })
            connection.release();
        });
    }
}
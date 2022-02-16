import pool from "./../config/dbConfig.js"

export default {
    
    async addEmail(req, res, next) {
        const queryEXIST = "SELECT * FROM `emails` WHERE `name` = ?";
        const queryINSERT = "INSERT INTO `emails` (`name`, `created_at`) VALUES (?, ?);";
        pool.getConnection((err, connection) => {
            if (err) 
                throw err;
            
            const params = req.body;
            const date = new Date();

            connection.query(queryEXIST, [params.email, date], (err, row) => {
                if (!err) {
                   if(row.length == 1){
                        return res.status(400).send({
                            err: "This email already exist!"
                        });
                   }
                   else {
                    connection.query(queryINSERT, [params.email, date], (err) => {
                        if (!err) {
                            return res.status(200).send({
                                msg: `Email: ${params.email} has been added succesfull!`
                            });
                        }
                        else {
                            console.log(err);
                            return res.status(400).send(err);
                        }
                    })
                   }
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
const mysql = require('mysql2')
export const mysqlpool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'project_web_apt'
})
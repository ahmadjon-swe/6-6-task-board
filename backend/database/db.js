const {Pool} = require("pg")

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  database: 'task_board',
  password: 'P0asmowq9a0xkoc@4gah()Ajidjsn'
})

module.exports = pool
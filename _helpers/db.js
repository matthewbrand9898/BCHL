const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const fs = require('fs');

module.exports = db = {};

initialize();

async function initialize() {
  try {    // create db if it doesn't already exist
      const { host, port, user, password, database } = config.database;
      db.connection = await mysql.createPool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      ssl: {
          ca: fs.readFileSync(__dirname + '/ca.pem'),

      }
  });
      await db.connection.query(`CREATE DATABASE IF NOT EXISTS ${database} ;`);
    //  await db.connection.query(`CREATE DATABASE IF NOT EXISTS \`BCHAddressPool\`;`);
      await db.connection.query(`CREATE TABLE IF NOT EXISTS ${database}  . BCHAddresses (id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,BCHAddress VARCHAR(100) NOT NULL) ;`);



      // connect to db
      const sequelize = new Sequelize(database,user,password ,{  port:'32033' , host:'mysql-32033-0.cloudclusters.net' ,dialect: 'mysql', logging: false,  ssl  : { ca : fs.readFileSync(__dirname + '/ca.pem') }});

      // init models and add them to the exported db object
      db.User = require('../users/user.model')(sequelize);

      // sync all models with database
      await sequelize.sync();
    } catch(err) {
      console.log(err)
    }

}

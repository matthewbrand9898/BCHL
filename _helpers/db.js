const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    db.connection = await mysql.createConnection('mysql://bebe19c45805a2:9b0bb6ca@us-cdbr-east-03.cleardb.com/heroku_9dedb930f2ef1f5?reconnect=true');
    await db.connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  //  await db.connection.query(`CREATE DATABASE IF NOT EXISTS \`BCHAddressPool\`;`);
    await db.connection.query(`CREATE TABLE IF NOT EXISTS heroku_9dedb930f2ef1f5 . BCHAddresses (id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,BCHAddress VARCHAR(100) NOT NULL) ;`);



    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
}

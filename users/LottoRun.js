const db = require('_helpers/db')
const { Sequelize } = require('sequelize');
const SendBCH = require('_helpers/send-bch')
const sendBch_ = new SendBCH()
const filename = `${__dirname}/wallet.json`
  class LottoRun {
    constructor(argv,config) {

      this.db = db
      this.sequelize = Sequelize

      this.sendBch_ = sendBch_
      this.filename = filename
    }



 sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async  Lotto_run() {
  await this.sleep(1000)

  const winnerAddress =   await db.connection.query(`SELECT BCHAddress FROM heroku_9dedb930f2ef1f5 . bchaddresses ORDER BY RAND() LIMIT 1`)

    var str = JSON.stringify(winnerAddress[0])
    var obj = JSON.parse(str);
var keys = Object.keys(obj);


        if(typeof obj[keys[0]] !== 'undefined' && obj[keys[0]]  !== null)
         await this.sendBch_.SendBch(this.filename,'bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7',1000,obj[keys[0]].BCHAddress)

          await db.connection.query(`DELETE  FROM heroku_9dedb930f2ef1f5 . bchaddresses `)
  await db.connection.query(`UPDATE heroku_9dedb930f2ef1f5 . users SET Ticket = 0 ;`)
//  const users = await this.db.User.findAll()
/* for(let i = 0;i < users.length;i++) {

  let   params = users[i].dataValues
    params.Ticket = 0
  //  console.log(params)


    Object.assign(users[i], params);
    await users[i].save();
  //  console.console.log((users[i]));
}
*/

  //  console.log(user.dataValues)

}
  }
module.exports = LottoRun

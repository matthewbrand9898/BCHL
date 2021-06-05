const db = require('_helpers/db')
const { Sequelize } = require('sequelize');
const SendBCHLotto = require('_helpers/send-bchLotto')
const sendBch_ = new SendBCHLotto()
const filename = `${__dirname}/wallet.json`
const NETWORK = 'mainnet'
// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
const BCHJS = require('@psf/bch-js')
let bchjs
if (NETWORK === 'mainnet') bchjs = new BCHJS({ restURL: BCHN_MAINNET })
  class LottoRun {
    constructor(argv,config) {

      this.db = db
      this.sequelize = Sequelize

      this.sendBch_ = sendBch_
      this.filename = filename
      this. bchjs = bchjs
    }



 sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async  Lotto_run() {

  try{

  let getBlockHash = await bchjs.Blockchain.getBestBlockHash();
  let randNumber = parseInt(getBlockHash, 16) ;
  randNumber = randNumber.toString();
  randNumber = randNumber.substring(0,randNumber.length - 4);
  let randomremainder = parseFloat(randNumber) % 1

  let winnerid = randomremainder * 10000000000000000
  winnerid = Math.round(winnerid % 1000000) + 1
  console.log('winner id ' + winnerid )

  const winnerAddress =   await db.connection.query(`SELECT BCHAddress FROM UserData . BCHAddresses WHERE betNumber = ${winnerid} LIMIT 1`)

    var str = JSON.stringify(winnerAddress[0])
    var obj = JSON.parse(str);
var keys = Object.keys(obj);


        if(typeof obj[keys[0]] !== 'undefined' && obj[keys[0]]  !== null) {
          let stop = false;
          let balance = await bchjs.Electrumx.balance('bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7');
        let  remaining = Math.round((balance.balance.confirmed + balance.balance.unconfirmed) * 0.05)
        let winningamount = Math.round((balance.balance.confirmed + balance.balance.unconfirmed) * 0.92)

         while(!stop) {
  const  returnvalues  =  await this.sendBch_.SendBch(this.filename,'bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7',winningamount,remaining,obj[keys[0]].BCHAddress,'bitcoincash:qzr0l9eh9k4lsyff4w7dhd8wnjkwv8wgkvsjcqnh3m')
  var Retobj = JSON.parse(returnvalues);
  var Retkeys = Object.keys(Retobj);
  if(Retobj[Retkeys[1]]) {
    stop = true

await db.connection.query(`UPDATE UserData . WinnerTxid SET TXID = '${Retobj[Retkeys[0]]}' WHERE id = 1; `)
                        }
                      }
                }
                await db.connection.query(`DELETE  FROM UserData . BCHAddresses `)
                await db.connection.query(`ALTER  TABLE UserData . BCHAddresses AUTO_INCREMENT  = 1 `)
            await db.connection.query(`UPDATE UserData . Users SET Ticket = 0 ;`)

}catch(err) {
  console.log(err)
}
}
  }
module.exports = LottoRun

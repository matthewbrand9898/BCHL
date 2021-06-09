const db = require('_helpers/db')
const { Sequelize } = require('sequelize');
const SendBCHLotto = require('_helpers/send-bchLotto')
const sendBch_ = new SendBCHLotto()
var crypto = require('crypto');
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





async  Lotto_run() {

  try{


  var randomNumber =  await db.connection.query(`SELECT RandomNumber FROM UserData . LottoRun WHERE id = 1 `)
//console.log('randome number ' + randomNumber[0][0].RandomNumber)
  var entries = await db.connection.query(`SELECT COUNT(*) AS Count FROM UserData . BCHAddresses `)
//console.log('entries ' + entries[0][0].Count)
var winnerid = (randomNumber[0][0].RandomNumber % entries[0][0].Count) + 1;

if(entries[0][0].Count == 0) {
  winnerid = 0;
}
//console.log('winner ' + winnerid)
  const winnerAddress =   await db.connection.query(`SELECT BCHAddress FROM UserData . BCHAddresses WHERE id = ${winnerid} LIMIT 1`)




        if(winnerAddress[0][0] !== undefined && winnerAddress[0][0]  !== null) {
          let stop = false;
          let balance = await bchjs.Electrumx.balance('bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7');
        let  remaining = Math.round((balance.balance.confirmed + balance.balance.unconfirmed) * 0.05)
        let winningamount = Math.round((balance.balance.confirmed + balance.balance.unconfirmed) * 0.92)

         while(!stop) {

  const  returnvalues  =  await this.sendBch_.SendBch(this.filename,'bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7',winningamount,remaining,winnerAddress[0][0].BCHAddress,'bitcoincash:qzr0l9eh9k4lsyff4w7dhd8wnjkwv8wgkvsjcqnh3m')

  if(returnvalues.Ticket) {
    stop = true

    var newRandomNumber = Math.floor(Math.random() * 10000000) + 1;
  //  console.log(newRandomNumber)
    var newRandomNumberStr = newRandomNumber.toString();
var hash = crypto.createHash('sha256').update(newRandomNumberStr,'binary').digest('hex');
  //console.log(hash);
    await db.connection.query(`UPDATE UserData . LottoRun SET RandomNumberHash = '${hash}', RandomNumber = '${newRandomNumber}' WHERE id = 1; `)
    await db.connection.query(`DELETE  FROM UserData . BCHAddresses `)
    await db.connection.query(`ALTER  TABLE UserData . BCHAddresses AUTO_INCREMENT  = 1 `)
  await db.connection.query(`UPDATE UserData . Users SET Ticket = 0 ;`)
await db.connection.query(`UPDATE UserData . WinnerTxid SET TXID = '${returnvalues.txid}' WHERE id = 1; `)
                        }
                      }
                }


}catch(err) {
  console.log(err)
}
}
  }
module.exports = LottoRun

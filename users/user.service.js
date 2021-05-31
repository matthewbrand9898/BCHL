const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const GetAddress = require('slp-cli-wallet/src/commands/get-address')
const getAddress = new GetAddress()
const SendBCH = require('_helpers/send-bch')
const sendBch_ = new SendBCH()
const fs = require('fs').promises;
//const GetBalanceByAddress = require('slp-cli-wallet/src/commands/update-balances')
//const getbal = new GetBalanceByAddress()

const NETWORK = 'mainnet'
// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
const BCHJS = require('@psf/bch-js')
let bchjs
if (NETWORK === 'mainnet') bchjs = new BCHJS({ restURL: BCHN_MAINNET })
let txid
const filename = `${__dirname}/wallet.json`

module.exports = {
    authenticate,
    create,
    update,
   buyticket,
   withdraw,
   getbalance,
   getlastlottowinner,
   currentEntries
};

async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}



async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
    params.BCHAddress = await getAddress.getAddress(filename);
    params.Ticket = 0;
    // save user
    await db.User.create(params);
    //console.log(params.BCHAddress);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save

    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}


// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

async function buyticket(user) {
 let current = await bchjs.Price.getBchUsd();
 let usdToSat = Math.round(5 / current * 100000000)
   const returnvalues = await sendBch_.SendBch(filename,user.BCHAddress,usdToSat,'bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7')
   var obj = JSON.parse(returnvalues);
   var keys = Object.keys(obj);

  let bchadd = user.BCHAddress
    if(obj[keys[1]]) {
      user.Ticket ++

       await update(user.id,user)
        await db.connection.query(`INSERT INTO UserData . BCHAddresses  (BCHAddress) VALUES ('${bchadd}');`);

      //  console.log(bchadd)
   } else {

     throw 'Purchase unsuccessful, please check your balance.';

   }


return user;
}


async function getbalance(user) {
  try {

    var balance = await bchjs.Electrumx.balance(user.BCHAddress)
   let current = await bchjs.Price.getBchUsd();

   balance = balance.balance.confirmed/100000000  * current
  user.balance = balance


  return user

    }
    catch(err)
     {
  console.log(err);
    }

}


async function getlastlottowinner(txid) {

  try {
    const data = await fs.readFile("winnerTxid.txt", "binary");
       txid.txid = data.toString();

       return txid;


    }
    catch(err)
     {
  console.log(err);
    }
}

async function currentEntries(currentEntries) {

  try {

  entries = await db.connection.query(`SELECT COUNT(*) AS Count FROM UserData . BCHAddresses `)
  var cej = JSON.stringify(entries[0])
  var obj = JSON.parse(cej);
  var keys = Object.keys(obj);
    currentEntries.currentEntries = obj[keys[0]].Count

       return currentEntries

    }
    catch(err)
     {
  console.log(err);
    }
}




async function withdraw(user,withdrawaddress,withdrawamount) {
  let current = await bchjs.Price.getBchUsd();
  let usdToSat = Math.round(withdrawamount / current * 100000000)

const returnvals   =  await sendBch_.SendBch(filename,user.BCHAddress,usdToSat,withdrawaddress)
var obj = JSON.parse(returnvals);
var keys = Object.keys(obj);
    //console.log(purchase)
      if(!obj[keys[1]]) {
        throw 'Failed to withdraw, please check address format and balance.'
      }

}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

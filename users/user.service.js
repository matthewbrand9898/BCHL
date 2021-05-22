const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const GetAddress = require('slp-cli-wallet/src/commands/get-address')
const getAddress = new GetAddress()
const SendBCH = require('_helpers/send-bch')
const sendBch_ = new SendBCH()
//const GetBalanceByAddress = require('slp-cli-wallet/src/commands/update-balances')
//const getbal = new GetBalanceByAddress()
const filename = `${__dirname}/wallet.json`

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
   buyticket
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
    const purchase = await sendBch_.SendBch(filename,user.BCHAddress,1000,'bitcoincash:qrm9uly75rcn30f3v5amqy97dcn0zga2jqakkdmdu7')
    //console.log(purchase)


  let bchadd = user.BCHAddress
    if(purchase) {
        await db.connection.query(`INSERT INTO bchaddresspool . bchaddresses  (BCHAddress) VALUES ('${bchadd}');`);
             user.Ticket ++
              await update(user.id,user)
      //  console.log(bchadd)
   }



}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

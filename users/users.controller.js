const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');

const NETWORK = 'mainnet'
// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
const BCHJS = require('@psf/bch-js')
let bchjs
if (NETWORK === 'mainnet') bchjs = new BCHJS({ restURL: BCHN_MAINNET })


// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
//router.get('/', authorize(), getAll);
//router.get('/current', authorize(), getCurrent);
//router.get('/:id', authorize(), getById);
//router.put('/update', authorize(), updateSchema, update);
router.post('/buyticket', authorize(), buyticket);
router.post('/getbalance', authorize(), getBalance);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
      firstName: Joi.string().empty(''),
      lastName: Joi.string().empty(''),
      username: Joi.string().empty(''),
      password: Joi.string().min(6).empty(''),
      BCHAddress: Joi.string().empty(''),
      Ticket: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty(''),
        BCHAddress: Joi.string().empty(''),
        Ticket: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {

    userService.update(req.user.id, req.body)


        .then(user => res.json(user))
        .catch(next);

}



async function getBalance(req,res,next) {

  try {

    var balance = await bchjs.Electrumx.balance(req.user.BCHAddress)
   let current = await bchjs.Price.getBchUsd();

   balance = balance.balance.confirmed/100000000  * current


      res.json({ message: balance});



    }
    catch(err)
     {
  console.log(err);
    }

}

function buyticket(req, res, next) {
  userService.buyticket(req.user)
  .then(() => res.json(req.user ))
  .catch(next);

}

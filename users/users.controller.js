const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');




// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
//router.get('/', authorize(), getAll);
//router.get('/current', authorize(), getCurrent);
//router.get('/:id', authorize(), getById);
//router.put('/update', authorize(), updateSchema, update);
router.post('/buyticket', authorize(), buyticket);
router.post('/withdraw', authorize(), withdraw);
router.post('/getbalance', authorize(), getbalance);
router.post('/getlastlottowinner', authorize(), getlastlottowinner);
router.post('/currentEntries', authorize(), currentEntries);


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



async function getbalance(req,res,next) {


        userService.getbalance(req.user)
        .then(() => res.json(req.user.balance ))
        .catch(next);


}
async function getlastlottowinner(req,res,next) {


        userService.getlastlottowinner(req.body)
        .then(() => res.json( req.body))
        .catch(next);


}

async function currentEntries(req,res,next) {


        userService.currentEntries(req.body)
        .then(() => res.json( req.body))
        .catch(next);


}


function buyticket(req, res, next) {
  userService.buyticket(req.user)
  .then(() => res.json(req.user.Ticket ))
  .catch(next);

}

function withdraw(req, res, next) {


  userService.withdraw(req.user,req.body[1].address,req.body[1].amount)
  .then(() => res.json({message: "successfully sent " + req.body[1].amount + " to " +  req.body[1].address}))
  .catch(next);

}

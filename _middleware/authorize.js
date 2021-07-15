const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize() {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // attach full user record to request object
        async (req, res, next) => {
          try {
            if(db.User != undefined) {
            const user = await db.User.findByPk(req.user.sub);
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });
                // authorization successful
                req.user = user.get();
                next();
          }
            //console.log(user)
            // check user still exists



          }catch(err) {
            console.log(err)
          }

        }
    ];
}

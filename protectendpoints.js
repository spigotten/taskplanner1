const jwt = require('jsonwebtoken');

const secret = "codingisfun!"; //for tokens - should be stored as an enviroment variable

let protect =  {};
protect.logindata = "no data";
protect.protectEndpoints = function(req, res, next) {

    let token = req.headers['authorization'];     

    if (token) {
        try {
            protect.logindata = jwt.verify(token, secret);            
            next();
        } catch (err) {
            
            res.status(403).json({ msg: "Not a valid token" });
        }
    }
    else {
        res.status(403).json({ msg: "no token" });
    }
}


module.exports = protect;
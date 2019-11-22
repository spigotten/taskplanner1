const express = require('express');
const router = express.Router();

let dbURI;
try {
    dbURI = require("./classified").env.DATABASE_URL;
}
catch(err){
    console.log("server kjører ikke lokalt")
}

let protect = require('./protectendpoints.js');
const pg = require('pg');



const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring });

const bcrypt = require('bcrypt');
const secret = "codingisfun!"; //for tokens - should be stored as an enviroment variable
const jwt = require('jsonwebtoken');

//endpoint user POST --------------
router.post('/', async function (req, res) {

    let updata = req.body;  //the data sent from the client

    //hashing the password before it is stored in the DB
    let hash = bcrypt.hashSync(updata.passwrd, 10);

    let sql = 'INSERT INTO users (id, email, pswhash) VALUES(DEFAULT, $1, $2) RETURNING *';
    let values = [updata.email, hash];

    try {
        let result = await pool.query(sql, values);

    if (result.rows.length > 0) {
        res.status(200).json({ msg: "Din profil er nå opprettet, klikk: 'Gå til logg inn' " }); // send response
    }
    else {
        throw "Insert failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// endpoint - auth (login) POST ---------------
router.post('/auth', async function (req, res) {

    let updata = req.body; //the data sent from the client

    //get the user from the database
    let sql = 'SELECT * FROM users WHERE email = $1';
    let values = [updata.email];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "Brukeren eksisterer ikke" });
        }
        else {
            let check = bcrypt.compareSync(updata.passwrd, result.rows[0].pswhash);
            if(check == true) {
                let payload = { userid: result.rows[0].id };
                let tok = jwt.sign(payload, secret, {expiresIn: "12h"}); //create token
                res.status(200).json({email: result.rows[0].email, userid: result.rows[0].id, token: tok});
            }
            else {
                res.status(400).json({ msg: "Feil passord" });
            }
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

//------------ Delete users------------

router.delete('/remove', async function (req, res) {

    let updata = req.body; //the data sent from the client

    let sql = 'DELETE FROM users WHERE id = $1 RETURNING *';
    let values = [protect.logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" }); //send response
        }
        else {
            throw "Delete failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// endpoint - brukerkonto get -----------------------
router.get('/brukerkonto', async function (req, res){


    let sql = 'SELECT * FROM users WHERE id = $1';



    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});


// UPDATE PROFILE-----------

router.put('/password', async function (req, res) {

    let updata = req.body;
    let hash = bcrypt.hashSync(updata.pswhash, 10);    

    let sql = 'UPDATE users SET pswhash = $2 WHERE id = $1 RETURNING *';
    let values = [protect.logindata.userid, hash];
    

    try {

        

        let result = await pool.query(sql, values);
        console.log("uuuuuu", result.rows);

        if (result.rows.length > 0) {
            res.status(200).json({msg: "Passord oppdatert"}); //send respons
        } else {
            throw "insert failed";
        }        
    }
    catch (err){
        res.status(500).json(err); //send error respons
        console.log(err);
    }
});

module.exports = router;
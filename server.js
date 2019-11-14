const cors = require('cors'); //when the clients arent on the server

const pg = require('pg');
const dbURI = "postgres://xcpzxxwrhtvbba:e519eb17a3dd7c15b14f3c9f790529d1052903b25ca1760a6406274e2ae0808d@ec2-54-246-105-238.eu-west-1.compute.amazonaws.com:5432/d2g1f4b3tnrq7s" + "?ssl=true";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring });

const secret = "codingisshit!"; //for tokens - should be stored as an enviroment variable
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express(); //server-app


let logindata;

// middleware----------------
app.use(cors());
app.use(express.json());
app.use('/', express.static('client'));
app.use('/planner', protectEndpoints);
app.use('/listeinnhold', protectEndpoints);

//function used for protecting endpoints -------------------
function protectEndpoints(req, res, next) {

    let token = req.headers['authorization'];

    if (token) {
        try {
            logindata = jwt.verify(token, secret);
            next();
        } catch (err) {
            res.status(403).json({ msg: "Not a valid token" });
        }
    }
    else {
        res.status(403).json({ msg: "no token" });
    }
}

// endpoint - planner GET --------------------
app.get('/planner', async function (req, res) {
    
    let sql = 'SELECT * FROM planner WHERE userid = $1';
    let values = [logindata.userid];
    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response
    }
    catch(err) {
        res.status(500).json({ error: err }); //send error response
    }
});

//endpoint - planner POST ---------------------
app.post('/planner', async function (req, res) {
    
    let updata = req.body; //the data sent from the client

    let sql = 'INSERT INTO planner (id, destination, date, userid) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.dest, updata.date, updata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK" }); //send response
        }
        else {
            throw "Insert failed";
        }

    }
   catch (err) {
       res.status(500).json({ error: err }); //send error response
   }
});

// endpoint - planner DELETE -----------------------
app.delete('/planner', async function (req, res){

    let updata = req.body; //the data sent from the client

    let sql = 'DELETE FROM planner WHERE id = $1 RETURNING *';
    let values = [updata.plannerID];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0){
            res.status(200).json({msg: "Delete OK"}); // send response
        }
        else{
            throw "Delete failed";
        }
    }
    catch(err) {
        res.status(500).json({error: err});
    }
});


//endpoint - listeinnhold GET ----------------
app.get('/listeinnhold', async function (req, res) {

    let plannerid = req.query.plannerid; //the data sent from the client

    let sql = 'SELECT * FROM listeinnhold WHERE plannerid = $1';
    let values = [plannerid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response
        }
    catch(err) {
        res.status(500).json({ error: err }); //send error response
    }
});

//endpoint - listeinnhold POST ----------------
app.post('/listeinnhold', async function (req, res) {

    let updata = req.body; // the data sent from client

    let sql = 'INSERT INTO listeinnhold (id, description, plannerid, deadline) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.descr, updata.plannerid, updata.deadline];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK" }); // send response
        }
        else {
            throw "Insert failed";
        }
    }
    catch(err) {
        res.status(500).json({ error: err }); // send error response
    }
});

//endpoint listeinnhold DELETE--------------
app.delete('/listeinnhold', async function (req, res) {

    let updata = req.body; //the data sent from the client

    let sql = 'DELETE FROM listeinnhold WHERE id = $1 RETURNING *';
    let values = [updata.listeinnholdID];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" }); //send response
        }
        else {
            throw "Delete failed";
        }
    }
    catch(err) {
        res.status(500).json({ error: err }); //send error response
    }
});


//endpoint user POST --------------

app.post('/users', async function (req, res) {

    let updata = req.body;  //the data sent from the client

    //hashing the password before it is stored in the DB
    let hash = bcrypt.hashSync(updata.passwrd, 10);

    let sql = 'INSERT INTO users (id, email, pswhash) VALUES(DEFAULT, $1, $2) RETURNING *';
    let values = [updata.email, hash];

    try {
        let result = await pool.query(sql, values);

    if (result.rows.length > 0) {
        res.status(200).json({ msg: "Insert OK" }); // send response
    }
    else {
        throw "Insert failed";
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({ error: err }); //send error response
    }
});


// endpoint - auth (login) POST ---------------
app.post('/auth', async function (req, res) {

    let updata = req.body; //the data sent from the client

    //get the user from the database
    let sql = 'SELECT * FROM users WHERE email = $1';
    let values = [updata.email];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({msg: "User doesnt exist"});
        }
        else {
            let check = bcrypt.compareSync(updata.passwrd, result.rows[0].pswhash);
            if(check == true) {
                let payload = {userid: result.rows[0].id};
                let tok = jwt.sign(payload, secret, {expiresIn: "12h"}); //create token
                res.status(200).json({email: result.rows[0].email, userid: result.rows[0].id, token: tok});
            }
            else {
                res.status(400).json({msg: "Wrong password"});
            }
        }
    }
    catch(err) {
        res.status(500).json({error: err});
    }
});




// start server------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log ('server lisening on port 3000!');
});
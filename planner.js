const express = require('express');
const router = express.Router();
let protect = require('./protectendpoints.js');

const pg = require('pg');
const dbURI = "postgres://xcpzxxwrhtvbba:e519eb17a3dd7c15b14f3c9f790529d1052903b25ca1760a6406274e2ae0808d@ec2-54-246-105-238.eu-west-1.compute.amazonaws.com:5432/d2g1f4b3tnrq7s" + "?ssl=true";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring });


// endpoint - planner GET --------------------
router.get('/', async function (req, res) {
    
    let sql = 'SELECT * FROM planner WHERE userid = $1';
    
    let values = [protect.logindata.userid];
    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

//endpoint - planner POST ---------------------
router.post('/', async function (req, res) {
    
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

// endpoint - shared get -----------------------
router.get('/shared', async function (req, res){


    let sql = 'SELECT * FROM planner WHERE shared = true';



    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows);
    }
    catch(err) {
        res.status(500).json({error: err});
    }
});

router.put('/', async function (req, res) {

    let updata = req.body;

    let sql = 'UPDATE planner SET destination = $2, shared = $3 WHERE id = $1';
    let values = [updata.id, updata.destination, updata.shared];

    try {
        await pool.query(sql, values);

            res.status(200).json({msg: "List updated"}); //send respons
    }
    catch (err){
        res.status(500).json(err); //send error respons
    }
});

//endpoint List planner UPDATE------

router.put('/', async function (req, res) {

    let updata = req.body;

    let sql = 'UPDATE planner SET destination = $2, shared = $3 WHERE id = $1';
    let values = [updata.id, updata.destination, updata.shared];

    try {
        await pool.query(sql, values);

            res.status(200).json({msg: "liste oppdatert"}); //send respons
    }
    catch (err){
        res.status(500).json(err); //send error respons
    }
});




module.exports = router;
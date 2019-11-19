const express = require('express');
const router = express.Router();
let protect = require('./protectendpoints.js');

const pg = require('pg');
const dbURI = "postgres://xcpzxxwrhtvbba:e519eb17a3dd7c15b14f3c9f790529d1052903b25ca1760a6406274e2ae0808d@ec2-54-246-105-238.eu-west-1.compute.amazonaws.com:5432/d2g1f4b3tnrq7s" + "?ssl=true";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring });

//endpoint - listeinnhold GET ----------------
router.get('/', async function (req, res) {

    let plannerid = req.query.plannerid; //the data sent from the client

    let sql = 'SELECT * FROM listeinnhold WHERE plannerid = $1';
    let values = [plannerid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response
        }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

//endpoint - listeinnhold POST ----------------
router.post('/', async function (req, res) {

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
    catch (err) {
        res.status(500).json({ error: err }); // send error response
    }
});

//endpoint listeinnhold DELETE--------------
router.delete('/', async function (req, res) {

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
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

module.exports = router;
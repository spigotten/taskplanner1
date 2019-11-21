const cors = require('cors'); //when the clients arent on the server

const pg = require('pg');
const dbURI = "postgres://xcpzxxwrhtvbba:e519eb17a3dd7c15b14f3c9f790529d1052903b25ca1760a6406274e2ae0808d@ec2-54-246-105-238.eu-west-1.compute.amazonaws.com:5432/d2g1f4b3tnrq7s" + "?ssl=true";
const connstring = process.env.DATABASE_URL || dbURI;

const express = require('express');
const app = express(); //server-app


let protect = require('./protectendpoints.js');

// middleware----------------
app.use(cors());
app.use(express.json());
app.use('/', express.static('client'));
app.use('/planner', protect.protectEndpoints);
app.use('/listeinnhold', protect.protectEndpoints);
app.use('/users/remove', protect.protectEndpoints);

let planner = require('./planner.js');
let listeinnhold = require('./listeinnhold.js');
let users = require('./users.js');
app.use('/listeinnhold', listeinnhold);
app.use('/planner', planner);
app.use('/users', users);





// start server------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
});
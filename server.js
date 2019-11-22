const cors = require('cors'); //when the clients arent on the server

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
app.use('/users/password', protect.protectEndpoints);
//app.use('/users/brukerkonto', protect.protectEndpoints);

let planner = require('./planner.js');
let listeinnhold = require('./listeinnhold.js');
let users = require('./users.js');
app.use('/listeinnhold', listeinnhold);
app.use('/planner', planner);
app.use('/users', users);
//app.use('/brukerkonto', brukerkonto);





// start server------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("server running 3000");
});
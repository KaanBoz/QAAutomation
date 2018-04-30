/*Modules*/
var express = require('express');
var app = express();
var cookie = require('cookie');
var bodyParser = require('body-parser');
var localize = require('localize');
var sha512 = require('sha512');
var session = require('express-session');
var mysql = require('mysql');
/*crypto module and variables*/
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = 'd6F3Efeq';
/*App settings*/
app.set('view engine', 'pug')
app.use(session({secret: 'qaUserSc'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, function () {
    console.log('Report Automation listening on port 3000!');
  });
/*Variables*/
var router = express.Router();
/*Custom Modules*/
var localization = require('./custom_modules/localization.js')(app, localize);
var functions = require('./custom_modules/functions.js')(app, cookie, localization.myLocalize, sha512, crypto, algorithm, password);
var db = require('./custom_modules/db.js')(app, mysql, functions, dbCallback);

function dbCallback(){
    /*Pages*/
    var users = require('./pages/qaallusers.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallmaterials = require('./pages/qaallmaterials.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qamaterialoperation = require('./pages/qamaterialoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysesheaders = require('./pages/qaallanalysisheaders.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysesdetails = require('./pages/qaallanalysisdetails.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var main = require('./pages/welcome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var logout = require('./pages/logout.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var login = require('./pages/login.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qauseroperation = require('./pages/qauseroperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisheaderoperation = require('./pages/qaanalysisheaderoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisdetailoperation = require('./pages/qaanalysisdetailoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysistype = require('./pages/qaanalysistype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunittype = require('./pages/qaunittype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysistypeoperation = require('./pages/qaanalysistypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunittypeoperation = require('./pages/qaunittypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisstandart = require('./pages/qaanalysisstandart.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisstandartoperation = require('./pages/qaanalysisstandartoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    /*Apis*/
    var usersTable = require('./api/qaalluserstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysisTypeTable = require('./api/qaanalysistypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var unitTypeTable = require('./api/qaunittypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysisStandartTable = require('./api/qaanalysisstandarttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisheadertable = require('./api/qaallanalysisheadertable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallmaterialstable = require('./api/qaallmaterialstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisdetailtable = require('./api/qaallanalysisdetailtable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    /*Base Router*/
    app.get('/', function (req, res) {
        res.redirect('/login');
    });
    /*Generic pages (Not found must be at the end)*/
    var permissionDenied = require('./pages/permissiondenied.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var notfound = require('./pages/notfound.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
}


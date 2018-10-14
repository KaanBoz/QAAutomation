/*Kaan Boz*/
/*Modules*/
var express = require('express');
var app = express();
var cookie = require('cookie');
var bodyParser = require('body-parser');
var localize = require('localize');
var sha512 = require('sha512');
var session = require('express-session');
var mysql = require('mysql');
var fs = require('fs');
var pdf = require('html-pdf');
var path = require('path');
var extract = require('pdf-text-extract')
var formidable = require('formidable');
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
    var main = require('./pages/welcome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var logout = require('./pages/logout.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var login = require('./pages/login.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallusers = require('./pages/qaallusers.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var productlist = require('./pages/productlist.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisheaders = require('./pages/qaallanalysisheaders.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisdetails = require('./pages/qaallanalysisdetails.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallcorrections = require('./pages/qaallcorrections.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallcorrectionsarchive = require('./pages/qaallcorrectionsarchive.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysistype = require('./pages/qaanalysistype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunittype = require('./pages/qaunittype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisstandart = require('./pages/qaanalysisstandart.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallmaterials = require('./pages/qaallmaterials.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallqualityfollowup = require('./pages/qaallqualityfollowup.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunassigned = require('./pages/qaunassigned.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaassigntome = require('./pages/qaassigntome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaassignedtome = require('./pages/qaassignedtome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaeditassigned = require('./pages/qaeditassigned.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaprintreport = require('./pages/qaprintreport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaprintreportarchive = require('./pages/qaprintreportarchive.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qauseroperation = require('./pages/qauseroperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var product = require('./pages/product.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisheaderoperation = require('./pages/qaanalysisheaderoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisdetailoperation = require('./pages/qaanalysisdetailoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysistypeoperation = require('./pages/qaanalysistypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunittypeoperation = require('./pages/qaunittypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaanalysisstandartoperation = require('./pages/qaanalysisstandartoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qamaterialoperation = require('./pages/qamaterialoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qafollowupoperation = require('./pages/qafollowupoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaeditmasteralloyresult = require('./pages/qaeditmasteralloyresult.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaeditresult = require('./pages/qaeditresult.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaresults = require('./pages/qaresults.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qacorrections = require('./pages/qacorrections.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qacalculation = require('./pages/qacalculation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qacorrectionoperation = require('./pages/qacorrectionoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qareport = require('./pages/qareport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, path, cookie);
    var qareportoperation = require('./pages/qareportoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, path, cookie);
    var qacreatereport = require('./pages/qacreatereport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs);
    var qacreatereportoperation = require('./pages/qacreatereportoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs);
    var qareadpdf = require('./pages/qareadpdf.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, extract, path, formidable);
    var usersTable = require('./api/qaalluserstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysisTypeTable = require('./api/qaanalysistypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var unitTypeTable = require('./api/qaunittypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var analysisStandartTable = require('./api/qaanalysisstandarttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisheadertable = require('./api/qaallanalysisheadertable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallmaterialstable = require('./api/qaallmaterialstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallanalysisdetailtable = require('./api/qaallanalysisdetailtable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallqualityfollowuptable = require('./api/qaallqualityfollowuptable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaassignedtometable = require('./api/qaassignedtometable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaeditmasteralloytable = require('./api/qaeditmasteralloytable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaedittable = require('./api/qaedittable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaresultstable = require('./api/qaresultstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qacreatereporttable = require('./api/qacreatereporttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaprintreporttable = require('./api/qaprintreporttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaprintreportarchivetable = require('./api/qaprintreportarchivetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qacorrectionstable = require('./api/qacorrectionstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallcorrectionstable = require('./api/qaallcorrectionstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaallcorrectionsarchivetable = require('./api/qaallcorrectionsarchivetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var qaunassignedtable = require('./api/qaunassignedtable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    /*Base Router*/
    app.get('/', function (req, res) {
        res.redirect('/login');
    });
    /*Generic pages (Not found must be at the end)*/
    var permissionDenied = require('./pages/permissiondenied.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    var notfound = require('./pages/notfound.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
}


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
    require('./pages/welcome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/logout.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/login.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallusers.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/productlist.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/customerlist.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallanalysisheaders.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/customeranalyses.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallanalysisdetails.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallcorrections.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallcorrectionsarchive.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysistype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaunittype.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysisstandart.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallmaterials.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaallqualityfollowup.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaunassigned.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaassigntome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaassignedtome.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaeditassigned.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaprintreport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaprintreportarchive.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qauseroperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/product.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/customer.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/spectralarchives.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/spectralarchive.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysisheaderoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/customeranlaysis.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysisdetailoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysistypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaunittypeoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaanalysisstandartoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qamaterialoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qafollowupoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaeditmasteralloyresult.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaeditresult.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qaresults.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qacorrections.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qacalculation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, path, cookie);
    require('./pages/qacorrectionoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/qareport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, path, cookie);
    require('./pages/qareportoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, path, cookie);
    require('./pages/qacreatereport.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs);
    require('./pages/qacreatereportoperation.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs);
    require('./pages/qareadpdf.js')(app, localization.myLocalize, functions, db.con, router, localization.localization, pdf, fs, extract, path, formidable);
    require('./api/qaalluserstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/producttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/customertable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaanalysistypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaunittypetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaanalysisstandarttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallanalysisheadertable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/customeranalysestable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallmaterialstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallanalysisdetailtable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallqualityfollowuptable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaassignedtometable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaeditmasteralloytable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaedittable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaresultstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qacreatereporttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaprintreporttable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaprintreportarchivetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qacorrectionstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallcorrectionstable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaallcorrectionsarchivetable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/qaunassignedtable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./api/spectralarchivestable.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    /*Base Router*/
    app.get('/', function (req, res) {
        res.redirect('/login');
    });
    /*Generic pages (Not found must be at the end)*/
    require('./pages/permissiondenied.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
    require('./pages/notfound.js')(app, localization.myLocalize, functions, db.con, router, localization.localization);
}


module.exports = function (app, myLocalize, functions, con, router, localization, pdf, fs, extract, path, formidable) {
    app.get('/qareadpdf', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.isoperator) {
                var realResults = [];
                res.render('qareadpdf',
                    {
                        data: req.body,
                        localization: localization,
                        userName: functions.capitalizeFirstLetter(sess.user.firstname),
                        userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                        isAdmin: sess.user.isadmin,
                        isChef: sess.user.ischef,
                        isOperator: sess.user.isoperator,
                        localizationVal: req.body.lang,
                        originalUrl: req.originalUrl,
                        id: req.query.id,
                        results: realResults,
                        resultsJson: JSON.stringify(realResults),
                        localizationJson: JSON.stringify(localization)
                    });
            } else {
                res.redirect('/permissiondenied');
            }
        } else {
            res.redirect('/');
        }
    });

    app.post('/qareadpdf', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.isoperator) {
                if (req.body.save) {
                    save(req, res, sess);
                } else {
                    getFields(req, res, sess);
                }
            } else {
                res.redirect('/permissiondenied');
            }
        } else {
            res.redirect('/');
        }
    });

    function readPdf(req, res, sess, fieldValues) {
        var form = new formidable.IncomingForm();
        req.fieldValues = fieldValues;
        form.parse(req, function (err, fields, files) {
            if (!files.filetoupload.size) {
                var realResults = [];
                res.render('qareadpdf',
                    {
                        data: req.body,
                        localization: localization,
                        userName: functions.capitalizeFirstLetter(sess.user.firstname),
                        userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                        isAdmin: sess.user.isadmin,
                        isChef: sess.user.ischef,
                        isOperator: sess.user.isoperator,
                        localizationVal: req.body.lang,
                        originalUrl: req.originalUrl,
                        results: realResults,
                        resultsJson: JSON.stringify(realResults),
                        localizationJson: JSON.stringify(localization)
                    });
            }
            extract(files.filetoupload.path, function (err, pages) {
                if (err) {
                    console.dir(err)
                    return
                }
                var firstSplit = pages[0].split('No');
                var secondSplit = [];
                for (var i = 2; i < firstSplit.length; i++) {
                    secondSplit.push(firstSplit[i].replace(' ', ''));
                }
                var thirdSplit = [];
                for (var i = 0; i < secondSplit.length; i++) {
                    var str = secondSplit[i].split('\n');
                    var thirdDummy = [];
                    for (var j = 0; j < str.length; j++) {
                        if (j == 1 || !str[j]) continue;
                        thirdDummy.push(str[j]);
                    }
                    thirdSplit.push(thirdDummy);
                }
                var elements = [];
                for (var i = 0; i < thirdSplit.length; i++) {
                    var str = thirdSplit[i][0].split(' ');
                    for (var z = 0; z < str.length; z++) {
                        if (!str[z]) continue;
                        var element = {}
                        element.values = []
                        element.short = str[z];
                        elements.push(element);
                    }
                }
                var values = [];
                var columns = 0;
                for (var i = 0; i < thirdSplit.length; i++) {
                    for (var j = 1; j < thirdSplit[i].length; j++) {
                        var str = thirdSplit[i][j].split(' ');
                        var shouldContinue = false;
                        for (var z = 0; z < str.length; z++) {
                            if (!str[z]) continue;
                            if (!shouldContinue) {
                                shouldContinue = true;
                                continue;
                            }
                            values.push(str[z].replace('<', ''));
                        }
                        if (columns == 0) {
                            columns = values.length;
                        }
                    }
                }
                var numberOfResults = values.length / elements.length;
                for (var i = 0; i < elements.length; i++) {
                    var rowMultiplier = Math.floor(i / columns);
                    var columnMultiplier = elements.length - (rowMultiplier * columns);
                    if (columnMultiplier > columns) {
                        columnMultiplier = columns;
                    }
                    for (var j = 0; j < numberOfResults; j++) {
                        elements[i].values.push(values[((columns * numberOfResults) * rowMultiplier) + (columnMultiplier * j) + i - (columns * rowMultiplier)]);
                    }
                }
                var results = [];
                for (var i = 0; i < numberOfResults; i++) {
                    var result = {};
                    result.values = [];
                    for (var k = 0; k < elements.length; k++) {
                        var value = {};
                        value.short = elements[k].short;
                        value.value = elements[k].values[i];
                        result.values.push(value);
                    }
                    results.push(result);
                }
                var fields = req.fieldValues;
                realResults = matchResults(fields, results);
                res.render('qareadpdf',
                    {
                        data: req.body,
                        localization: localization,
                        userName: functions.capitalizeFirstLetter(sess.user.firstname),
                        userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                        isAdmin: sess.user.isadmin,
                        isChef: sess.user.ischef,
                        isOperator: sess.user.isoperator,
                        localizationVal: req.body.lang,
                        results: realResults,
                        resultsJson: JSON.stringify(realResults),
                        localizationJson: JSON.stringify(localization),
                        id: req.query.id
                    });
            });
        });
    }

    function matchResults(fields, results) {
        var realResults = [];
        for (var i = 0; i < results.length; i++) {
            var result = [];
            var fieldUnfound = false;
            for (var j = 0; j < fields.length; j++) {
                var found = false;
                for (var k = 0; k < results[i].values.length; k++) {
                    if (found) break;
                    if (results[i].values[k].short == fields[j].materialshort) {
                        var line = {};
                        line.short = fields[j].materialshort;
                        line.value = results[i].values[k].value;
                        line.id = fields[j].id;
                        found = true;
                        result.push(line);
                    }
                }
                if (!found) {
                    fieldUnfound = true;
                    break;
                }
            }
            if (!fieldUnfound) {
                realResults.push(result);
            }
        }
        return realResults;
    }

    function getFields(req, res, sess) {
        var id = req.query.id;
        con.query("SELECT qualityfollowup.id, name, analysis, partyno, partydate, sender, explanation, " +
            "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " +
            "where qualityfollowup.id = " + id, function (err, result, fields) {
                if (err) {
                    console.log(err.message);
                    throw err;
                } else {
                    var qfu = result[0];
                    var analysisId = result[0].analysis;
                    //qfu.partydate = getFormattedDate(qfu.partydate);
                    con.query("select id, master from analysisdetail where header = " + analysisId, function (err, result, fields) {
                        if (err) {
                            console.log(err.message);
                            throw err;
                        } else {
                            var details = "";
                            var master_alloy = "";
                            for (var i = 0; i < result.length; i++) {
                                if (!master_alloy) {
                                    master_alloy += result[i].master;
                                } else {
                                    master_alloy += "," + result[i].master;
                                }
                                if (!details) {
                                    details += result[i].id;
                                } else {
                                    details += "," + result[i].id;
                                }
                            }
                            con.query(
                                " select analysisdetail.id as id, material.id as materialid, material.name as materialname, unittype.name as unitname, unittype.short as unitshort, material.short as materialshort, " +
                                " analysisdetail.max as max, analysisdetail.min as min from analysisdetail" +
                                " inner join material on material.id = analysisdetail.material" +
                                " inner join unittype on unittype.id = material.unit" +
                                " where analysisdetail.id in (" + details + ")", function (err, result, fields) {
                                    if (err) {
                                        console.log(err.message);
                                        throw err;
                                    } else {
                                        var values = result;
                                        var fieldValues = [];
                                        for (var i = 0; i < values.length; i++) {
                                            var field = {};
                                            field.id = values[i].id;
                                            field.materialid = values[i].materialid;
                                            field.materialname = values[i].materialname;
                                            field.unitname = values[i].unitname;
                                            field.unitshort = values[i].unitshort;
                                            field.materialshort = values[i].materialshort;
                                            field.max = values[i].max;
                                            field.min = values[i].min;
                                            for (var j = 0; j < details.split(",").length; j++) {
                                                if (details.split(",")[j] == field.id) {
                                                    field.master_alloy = master_alloy.split(",")[j]
                                                }
                                            }
                                            fieldValues.push(field);
                                        }
                                        readPdf(req, res, sess, fieldValues);
                                    }
                                });
                        }
                    });
                }
            });
    }

    function save(req, res, sess) {
        var results = req.body.results;
        var id = req.query.id;
        for (var i = 0; i < results.length; i++) {
            if (results[i].operation == "3") {
                //master
                con.query("SELECT qualityfollowup.id, name, analysis, partyno, partydate, sender, explanation, " + i + " as indexvalue, " +
                    "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " +
                    "where qualityfollowup.id = " + id, function (err, result, fields) {
                        var analysisId = result[0].analysis;
                        var index = result[0].indexvalue;
                        con.query(
                            "insert into masteralloyresult (analysis, followup, added_by, added_at, is_deleted" +
                            ", is_validated) VALUES" +
                            "('" + analysisId + "', " + id + ", " + sess.user.id + ", "
                            + con.escape(new Date()) + ", 0, 1)", function (err, result, fields) {
                                saveDetailsMaster(results[index].values, result.insertId);
                            });
                    });
            } else if (results[i].operation == "2") {
                //analiz
                con.query("SELECT qualityfollowup.id, name, analysis, partyno, partydate, sender, explanation, " + i + " as indexvalue, " +
                    "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " +
                    "where qualityfollowup.id = " + id, function (err, result, fields) {
                        var analysisId = result[0].analysis;
                        var index = result[0].indexvalue;
                        con.query(
                            "insert into analysisresult (analysis, followup, added_by, added_at, is_deleted" + 
                            ", is_validated) VALUES" + 
                            "('" + analysisId + "', " + id + ", " + sess.user.id + ", " 
                            + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                saveDetailsAnalysis(results[index].values, result.insertId);
                            });
                    });
            }
        }
        res.redirect('/qaeditassigned?id=' + id);
    }

    function saveDetailsMaster(detail, headerId) {
        if (detail) {
            for (var i = 0; i < detail.length; i++) {
                con.query("INSERT INTO masteralloyresultdetails (masteralloy, detailid, result, added_by, added_at, is_deleted" +
                    ", is_validated) VALUES" +
                    "(" + headerId + ", " + detail[i].id + ", " + detail[i].value + ", "
                    + sess.user.id + ", "
                    + con.escape(new Date()) + ", 0, 1)", function (err, result, fields) {
                    });
            }
        }
    }

    function saveDetailsAnalysis(detail, headerId){
        if(detail){
            for(var i = 0; i < detail.length; i++){
                con.query("INSERT INTO analysisresultdetails (analysisresult, detailid, result, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "(" + headerId + ", " + detail[i].id + ", " + detail[i].value + ", "
                + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                    if (err){
                        message = err.message;
                        return;    
                    }
                    return;
                });
            }
        }
    }


    return module;
}
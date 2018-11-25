module.exports = function (app, myLocalize, functions, con, router, localization, pdf, fs, path, cookie) {
    app.get('/qacalculation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.isoperator) {
                var id = req.query.id;
                con.query("SELECT id, analysis, partyno, amount, added_by FROM qualityfollowup where id = " + id,
                    function (err, result, fields) {
                        if (err) {
                            throw err;
                        }
                        var followup = result[0];
                        con.query("SELECT id, name FROM analysisheader where id = " + followup.analysis,
                            function (err, result, fields) {
                                if (err) {
                                    throw err;
                                }
                                var analysis = result[0];
                                con.query("SELECT material.name, analysisdetail.id, analysisdetail.material, max, min, master as master_alloy FROM analysisdetail" +
                                    " inner join material on material.id = analysisdetail.material " +
                                    " where analysisdetail.header = " + analysis.id,
                                    function (err, result, fields) {
                                        if (err) {
                                            throw err;
                                        }
                                        var details = result;

                                        con.query("SELECT id FROM masteralloyresult where followup =" + followup.id + " and is_deleted = 0",
                                            function (err, result, fields) {
                                                if (err) {
                                                    throw err;
                                                }
                                                var masterAlloyIds = [];
                                                for (var k = 0; k < result.length; k++) {
                                                    masterAlloyIds.push(result[k].id);
                                                }
                                                con.query("SELECT result, detailid FROM masteralloyresultdetails where masteralloy in (" + masterAlloyIds.toString() + ") and is_deleted = 0",
                                                    function (err, result, fields) {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        for (var y = 0; y < result.length; y++) {
                                                            for (var i = 0; i < details.length; i++) {
                                                                if (!details[i].master_alloy_result) {
                                                                    details[i].master_alloy_result = 0;
                                                                }
                                                                if (details[i].id == result[y].detailid) {
                                                                    details[i].master_alloy_result = parseFloat(parseFloat(details[i].master_alloy_result + result[y].result).toFixed(2));
                                                                }
                                                            }
                                                        }
                                                        for (var i = 0; i < details.length; i++) {
                                                            details[i].master_alloy_result = details[i].master_alloy_result / masterAlloyIds.length;
                                                        }
                                                        con.query("SELECT id FROM analysisresult where followup =" + followup.id + " and is_deleted = 0",
                                                            function (err, result, fields) {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                var resultIds = [];
                                                                for (var k = 0; k < result.length; k++) {
                                                                    resultIds.push(result[k].id);
                                                                }
                                                                con.query("SELECT result, detailid FROM analysisresultdetails where analysisresult in (" + resultIds.toString() + ") and is_deleted = 0",
                                                                    function (err, result, fields) {
                                                                        if (err) {
                                                                            throw err;
                                                                        }
                                                                        for (var y = 0; y < result.length; y++) {
                                                                            for (var i = 0; i < details.length; i++) {
                                                                                if (!details[i].analysis_result) {
                                                                                    details[i].analysis_result = 0;
                                                                                }
                                                                                if (details[i].id == result[y].detailid) {
                                                                                    details[i].analysis_result = parseFloat(parseFloat(details[i].analysis_result + result[y].result).toFixed(2));
                                                                                }
                                                                            }
                                                                        }
                                                                        for (var i = 0; i < details.length; i++) {
                                                                            details[i].analysis_result = details[i].analysis_result / resultIds.length;
                                                                        }
                                                                        for (var i = 0; i < details.length; i++) {
                                                                            details[i].analysis_result_real = parseFloat((details[i].analysis_result - (details[i].master_alloy_result - details[i].master_alloy)).toFixed(2));
                                                                        }
                                                                        for (var i = 0; i < details.length; i++) {
                                                                            details[i].amount = parseFloat(parseFloat((followup.amount / 100) * details[i].analysis_result_real).toFixed(2));
                                                                            details[i].orginalAmount = details[i].amount;
                                                                            details[i].fullAmount = parseFloat(parseFloat(followup.amount).toFixed(2));
                                                                            details[i].orginalFullAmount = details[i].fullAmount;
                                                                            details[i].addedAmount = parseFloat(0);
                                                                            details[i].newResult = parseFloat(parseFloat(details[i].analysis_result_real).toFixed(2));
                                                                            details[i].analysisName = followup.partyno;
                                                                            details[i].analysisId = analysis.id;
                                                                            details[i].added_by = followup.added_by;
                                                                        }
                                                                        details.sort(compare);
                                                                        details.details = JSON.parse(JSON.stringify(details));
                                                                        details = calculate(res, req, details, 0);
                                                                        //renderPage(res, req, details); 
                                                                    });
                                                            });
                                                    });
                                            });
                                    });

                            });
                    });
            } else {
                res.redirect('/permissiondenied');
            }
        } else {
            res.redirect('/');
        }
    });

    function renderPage(res, req, details) {
        var formData = {};
        formData.details = [];
        for (var i = 0; i < details.length; i++) {
            detail = {};
            detail.id = details[i].id;
            detail.name = details[i].name;
            detail.addedAmount = details[i].addedAmount;
            detail.analysisName = details[i].analysisName;
            detail.analysisId = details[i].analysisId;
            detail.added_by = details[i].added_by;
            formData.details.push(detail);
        }
        res.render('qacalculation',
            {
                data: req.body,
                localization: localization,
                userName: functions.capitalizeFirstLetter(sess.user.firstname),
                userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                isAdmin: sess.user.isadmin,
                isChef: sess.user.ischef,
                isOperator: sess.user.isoperator,
                localizationVal: req.body.lang,
                formDataJson: JSON.stringify(formData),
                details: details
            });
    }

    function calculate(res, req, details, counter) {
        var isError = false;
        for (var i = 0; i < details.length; i++) {
            if (details[i].newResult < details[i].min) {
                details[i].error = 1
                details[i].errorMargin = parseFloat((details[i].min - details[i].newResult).toFixed(2));
                isError = true;
            } else if (details[i].newResult > details[i].max) {
                details[i].error = 2
                details[i].errorMargin = parseFloat((details[i].newResult - details[i].max).toFixed(2));
                isError = true;
            } else {
                details[i].error = 0;
                details[i].errorMargin = 0;
            }
        }
        counter++;
        if (counter > 3000) {
            details.calculated = 0;
            for (var i = 0; i < details.length; i++) {
                details[i].addedAmount = 0;
            }
            renderPage(res, req, details);
            return;
        }
        if (!isError) {
            //return details;
            details.calculated = 1;
            renderPage(res, req, details);
            return;
        } else {
            details = fixErrors(details);
            //return calculate(details);
            setTimeout(function () { calculate(res, req, details, counter) });
        }
    }

    function fixErrors(details) {
        var isSmallError = false;
        for (var i = 0; i < details.length; i++) {
            if (details[i].error == 1) {
                isSmallError = true;
            }
        }
        var isBigError = false;
        for (var i = 0; i < details.length; i++) {
            if (details[i].error == 2) {
                isBigError = true;
            }
        }
        if (!isSmallError && !isBigError) {
            return details;
        } else {
            if (isSmallError) {
                details = fixSmallError(details);
                return details
            }
            if (isBigError) {
                details = fixBigError(details);
                return details
            }
        }
    }

    function fixSmallError(details) {
        for (var i = 0; i < details.length; i++) {
            if (details[i].error == 1) {
                details[i].addedAmount = parseFloat(parseFloat(details[i].addedAmount + parseFloat(parseFloat((details[i].fullAmount / 100) * details[i].errorMargin).toFixed(2))).toFixed(2));
                break;
            }
        }
        details = reCalculate(details);
        return details;
    }

    function fixBigError(details) {
        var shouldBreak = false;
        for (var i = 0; i < details.length; i++) {
            if (details[i].error == 2) {
                for (var y = 0; y < details.length; i++) {
                    if (i == y) continue;
                    if (details[y].error == 2) continue;
                    var maxValue = parseFloat((parseFloat((details[y].max - details[y].newResult)).toFixed(2) / 25)).toFixed(2);
                    if (details[y].max == 100) {
                        var totalMaxValues = 0;
                        for (var z = 0; z < details.length; z++) {
                            totalMaxValues = parseFloat(parseFloat(totalMaxValues + details[z].min).toFixed(2));
                        }
                        var biggestMaxValue = parseFloat(100 - totalMaxValues).toFixed(2);
                        maxValue = parseFloat((parseFloat((biggestMaxValue - details[y].newResult)).toFixed(2) / 100)).toFixed(2);
                    }
                    details[y].addedAmount = parseFloat(parseFloat(details[y].addedAmount + parseFloat(parseFloat(parseFloat((details[y].fullAmount / 100)).toFixed(2) * maxValue).toFixed(2))).toFixed(2));
                    shouldBreak = true;
                    break;
                }
            }
            if (shouldBreak) {
                break;
            }
        }
        details = reCalculate(details);
        return details;
    }

    function reCalculate(details) {
        var addedAmount = 0;
        for (var i = 0; i < details.length; i++) {
            addedAmount = parseFloat(parseFloat(addedAmount + parseFloat(parseFloat(details[i].addedAmount).toFixed(2))).toFixed(2));
        }
        for (var i = 0; i < details.length; i++) {
            details[i].fullAmount = parseFloat(parseFloat(details[i].orginalFullAmount + addedAmount).toFixed(2));
            details[i].amount = parseFloat(parseFloat(details[i].orginalAmount + details[i].addedAmount).toFixed(2));
            details[i].newResult = parseFloat(
                parseFloat(
                    parseFloat(
                        details[i].amount / details[i].fullAmount
                    ) * 100
                ).toFixed(2)
            );
        }
        return details;
    }

    function compare(a, b) {
        if (a.amount < b.amount)
            return 1;
        if (a.amount > b.amount)
            return -1;
        return 0;
    }

    app.post('/qacalculation/print', function (req, res) {
        var id = req.query.id;
        var sql = 
        " select " +
        " qualityfollowup.partyno as partyno, "+
        " qualityfollowup.partydate as partydate, "+
        " ifnull(customer.customername,'Sentesbir') as customername, "+
        " analysisheader.name as name "+
        " from qualityfollowup "+
        " left join customer on customer.id = qualityfollowup.customer"+
        " inner join analysisheader on analysisheader.id = qualityfollowup.analysis"+
        " where qualityfollowup.id = " + id;
        con.query(sql, function (err, result, fields) {
            createPdf(res, req, req.body, result[0]);
        });
    });

    app.post('/qacalculation', function (req, res) {
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.isoperator) {
                var formData = req.body;
                var id = req.query.id;
                if (formData.type == 1) {
                    var sql =
                        "INSERT INTO correctionheader (" +

                        " analysisname," +
                        " analysisid," +
                        " owner," +

                        " added_by," +
                        " added_at," +
                        " is_deleted," +
                        " is_validated" +

                        ") VALUES" +
                        "(" +

                        "'" + formData.details[0].analysisName + "', " +
                        "" + formData.details[0].analysisId + ", " +
                        "" + formData.details[0].added_by + ", " +

                        "" + sess.user.id + ", " +
                        "" + con.escape(new Date()) + ", " +
                        "" + "0" + ", " +
                        "" + "1" +

                        ");";
                    con.query(sql,
                        function (err, result, fields) {
                            for (var i = 0; i < formData.details.length; i++) {
                                con.query(getDetailSql(result.insertId, formData.details[i]), function (err, result, fields) { });
                            }
                            var sql = "update qualityfollowup set calculated = 1 where id =" + id;
                            con.query(sql, function (err, result, fields) {
                                doubleCheck(id);
                            });
                            res.redirect('/qacorrections')
                        }
                    );
                } else {
                    var sql = "update qualityfollowup set nocorrection = 1, calculated = 1 where id =" + id;
                    con.query(sql, function (err, result, fields) {
                        doubleCheck(id);
                    });
                    res.redirect('/qacorrections')
                }
            }
        } else {
            res.redirect('/');
            return;
        }
    });

    function doubleCheck(id) {
        var sql = "select * from qualityfollowup where id =" + id;
        con.query(sql, function (err, result, fields) {
            var formData = result[0];
            if(formData.doublecheck){
                var newSql = "INSERT INTO qualityfollowup (partyno, partydate, assignedto, analysis, explanation," + 
                " customer, doublecheck, sender, amount, derivedfrom, isdone, isreported, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "('" + formData.partyno + "', " + con.escape(formData.partydate) + ", " 
                + formData.assignedto + ", " + formData.analysis + ", '" 
                + formData.explanation + "', " + formData.customer + ", " + 0 + ", "
                + "'" + formData.sender + "'," + formData.amount +  "," + id + ",0,0, " 
                + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)";
                con.query(newSql, function (err, result, fields) {
                    var a = 1;
                });
            }
        });
    }


    function getDetailSql(headerid, detail) {
        var sql =
            "INSERT INTO correctiondetails (" +

            " name," +
            " addedamount," +
            " headerid," +
            " analysisdetailid," +

            " added_by," +
            " added_at," +
            " is_deleted," +
            " is_validated" +

            ") VALUES" +
            "(" +

            "'" + detail.name + "', " +
            "'" + detail.addedAmount + "', " +
            "" + headerid + ", " +
            "" + detail.id + ", " +

            "" + sess.user.id + ", " +
            "" + con.escape(new Date()) + ", " +
            "" + "0" + ", " +
            "" + "1" +

            ");";
        return sql;
    }

    function createPdf(res, req, data, result){
        var pdfId = " " + result.name + "-" + result.partyno;
        var imgSrc = 'file://' + __dirname + '/';
        imgSrc = imgSrc.replace('pages/', '');
        imgSrc += "/public/images/reportLogo.png"
        imgSrc = path.normalize(imgSrc);
        var html = 
        "<img src='" + imgSrc + "' width='200' height='75' style='padding-left:10px; float: left;'/>" +
        "<h3 style=\" padding-top:10px; float: left; width:50%; text-align: center;\">" + localization.correction + "</h3>" + 
        "<br />" + 
        "<table>" +
            "<tr>" +
                "<th>" + localization.alloy + "</th>" +
                "<td>" + result.name + "</td>" +
                "<th>" + localization.partyno + "</th>" +
                "<td>" + result.partyno + "</td>" +
            "</tr>"+

            "<tr>" +
                "<th>" + localization.customer + "</th>" +
                "<td>" + result.customername + "</td>" +
                "<th>" + localization.productionDate + "</th>" +
                "<td>" + getFormattedDate(result.partydate) + "</td>" +
            "</tr>";


        html += "</table>";

        html += "<br />" + "<br />";

        html += "" +
        "<style>" +

            "html {" +
                "font-family: Arial, Helvetica, sans-serif;" +
            "}" +
            
            "table {" +
                "font-family: arial, sans-serif;" +
                "border-collapse: collapse;" +
                "width: 90%;" +
                "margin-left: 5%;" +
            "}" +

            "td, th {" +
                "border: 1px solid #dddddd;" +
                "text-align: left;" +
                "padding: 8px;" +
                "font-size: 8px;" +
            "}" +
        "</style>" +
        "<table>" +
            "<tr>" +
                "<th>" + localization.material + "</th>" +
                "<th>" + localization.addedAmount + "</th>" +
            "</tr>";
        for(var i = 0; i < data.details.length; i++){
            html += "<tr>" +
                "<td>" + data.details[i].name + "</td>" +
                "<td>" + data.details[i].addedAmount + "</td>" +
            "</tr>";
        }
        html += "</table>";
        var options = { format: 'A4' };
        pdf.create(html, options).toFile('./public/calc/' + 'correction' + pdfId + '.pdf', function(err, response) {
            if (err) return console.log(err);
            var file = fs.createReadStream('./public/calc/' + 'correction' + pdfId + '.pdf');
            var stat = fs.statSync('./public/calc/' + 'correction' + pdfId + '.pdf');
            res.send('/calc/' + 'correction' + pdfId + '.pdf');
            //res.setHeader('Content-Length', stat.size);
            //res.setHeader('Content-Type', 'application/pdf');
            //res.setHeader('Content-Disposition', 'attachment; filename=' + 'correction' + pdfId + '.pdf');
            //file.pipe(res);
        });
    }

    function getFormattedDate(date) {
        var year = date.getFullYear();
      
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
      
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        return day + '/' + month + '/' + year;
      }

    return module;
}



module.exports = function (app, myLocalize, functions, con, router, localization, pdf, fs) {
    app.get('/qareport', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                var id = req.query.id;
                con.query("SELECT id, partyno, analysis, amount FROM qualityfollowup where id = " + id,
                function(err, result, fields){
                    if(err){
                        throw err;
                    }
                    var analysisName = result[0].partyno;
                    var followup = result[0];
                    con.query("SELECT id,name FROM analysisheader where id = " + followup.analysis,
                    function(err, result, fields){
                        if(err){
                            throw err;
                        }
                        var analysis = result[0];
                        analysisName = result[0].name + "-" + analysisName;
                        con.query("SELECT material.name, analysisdetail.id, analysisdetail.material, max, min, master as master_alloy FROM analysisdetail" +
                            " inner join material on material.id = analysisdetail.material " +
                            " where analysisdetail.header = " + analysis.id ,
                        function(err, result, fields){
                            if(err){
                                throw err;
                            }
                            var details = result;

                            con.query("SELECT id FROM masteralloyresult where followup =" + followup.id + " and is_deleted = 0",
                            function(err, result, fields){
                                if(err){
                                    throw err;
                                }
                                var masterAlloyIds = [];
                                for(var k = 0; k < result.length; k++){
                                    masterAlloyIds.push(result[k].id);
                                }
                                con.query("SELECT result, detailid FROM masteralloyresultdetails where masteralloy in (" + masterAlloyIds.toString() + ") and is_deleted = 0",
                                function(err, result, fields){
                                    if(err){
                                        throw err;
                                    }
                                    for(var y = 0; y < result.length; y++){
                                        for(var i = 0; i < details.length; i++){
                                            if(!details[i].master_alloy_result){
                                                details[i].master_alloy_result = 0;
                                            }
                                            if(details[i].id == result[y].detailid){
                                                details[i].master_alloy_result += result[y].result;
                                            }
                                        }
                                    }
                                    for(var i = 0; i < details.length; i++){
                                        details[i].master_alloy_result = details[i].master_alloy_result / masterAlloyIds.length;
                                    }
                                    con.query("SELECT id FROM analysisresult where followup =" + followup.id + " and is_deleted = 0",
                                    function(err, result, fields){
                                        if(err){
                                            throw err;
                                        }
                                        var resultIds = [];
                                        for(var k = 0; k < result.length; k++){
                                            resultIds.push(result[k].id);
                                        }
                                        con.query("SELECT result, detailid FROM analysisresultdetails where analysisresult in (" + resultIds.toString() + ") and is_deleted = 0",
                                        function(err, result, fields){
                                            if(err){
                                                throw err;
                                            }
                                            for(var y = 0; y < result.length; y++){
                                                for(var i = 0; i < details.length; i++){
                                                    if(!details[i].analysis_result){
                                                        details[i].analysis_result = 0;
                                                    }
                                                    if(details[i].id == result[y].detailid){
                                                        details[i].analysis_result += result[y].result;
                                                    }
                                                }
                                            }
                                            for(var i = 0; i < details.length; i++){
                                                details[i].analysis_result = details[i].analysis_result / resultIds.length;
                                            }
                                            for(var i = 0; i < details.length; i++){
                                                details[i].analysis_result_real =  parseFloat((details[i].analysis_result - (details[i].master_alloy_result - details[i].master_alloy)).toFixed(2));
                                            }
                                            for(var i = 0; i < details.length; i++){
                                                details[i].amount = (followup.amount / 100) * details[i].analysis_result_real;
                                                details[i].fullAmount = parseFloat(followup.amount);
                                                details[i].addedAmount = 0;
                                                details[i].newResult = parseFloat(details[i].analysis_result_real);
                                            }
                                            var html = "<div id=\"pageHeader\">Default header</div>";
                                            html += "" +
                                            "<style>" +
                                                "table {" +
                                                    "font-family: arial, sans-serif;" +
                                                    "border-collapse: collapse;" +
                                                    "width: 100%;" +
                                                "}" +

                                                "td, th {" +
                                                    "border: 1px solid #dddddd;" +
                                                    "text-align: left;" +
                                                    "padding: 8px;" +
                                                "}" +
                                            "</style>" +
                                            "<table>" +
                                                "<tr>" +
                                                    "<th>Bileşen</th>" +
                                                    "<th>Min</th>" +
                                                    "<th>Maks</th>" +
                                                    "<th>Sonuc</th>" +
                                                "</tr>";
                                            //var test = 0;
                                            //while(test < 10){
                                                for(var i = 0; i < details.length; i++){
                                                    html += "<tr>" +
                                                        "<td>" + details[i].name + "</td>" +
                                                        "<td>" + details[i].min + "</td>" +
                                                        "<td>" + details[i].max + "</td>" +
                                                        "<td>" + details[i].analysis_result_real + "</td>" +
                                                    "</tr>";
                                                }
                                                //test++;
                                            //}
                                            
                                            html += "</table>";
                                            html += "<div id=\"pageFooter\">Default footer</div>";
                                            var options = { format: 'A4' };
                                            pdf.create(html, options).toFile('./reports/' + analysisName + '.pdf', function(err, response) {
                                                if (err) return console.log(err);
                                                var file = fs.createReadStream('./reports/' + analysisName + '.pdf');
                                                var stat = fs.statSync('./reports/' + analysisName + '.pdf');
                                                res.setHeader('Content-Length', stat.size);
                                                res.setHeader('Content-Type', 'application/pdf');
                                                res.setHeader('Content-Disposition', 'attachment; filename=' + analysisName + '.pdf');
                                                file.pipe(res);
                                            });
                                            //renderPage(res, req, details); 
                                        });
                                    });
                                });
                            });
                        });
                        
                    });                    
                }); 
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    function renderPage(res, req, details){
        res.render('qareport', 
        { 
            data: req.body,
            localization : localization,
            userName : functions.capitalizeFirstLetter(sess.user.firstname),
            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
            isAdmin : sess.user.isadmin,
            isChef : sess.user.ischef,
            isOperator : sess.user.isoperator,
            localizationVal : req.body.lang,
            details : details
        });
    }

    return module;
}



module.exports = function (app, myLocalize, functions, con, router, localization) {
    
    app.get('/qacreatereportoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            if(sess.user.ischef){
                var formData = getReportModel();
                getDetails(req, res, sess, formData);
            }
        }else{
            res.redirect('/');
        }    
    });

    app.post('/qacreatereportoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess.user.ischef){
                var formData = req.body;
                if(checkValues(formData)){
                    renderPage(req, res, sess, formData, localization.fillForm);
                    return;
                }
                saveReport(req, res, sess, formData);
            }
        }else{
            res.redirect('/');
            return;
        }
    });


    function renderPage(req, res, sess, formData, message){
        res.render('qacreatereportoperation', 
                { 
                    data: req.body,
                    userName : functions.capitalizeFirstLetter(sess.user.firstname),
                    userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                    isAdmin : sess.user.isadmin,
                    isChef : sess.user.ischef,
                    isOperator : sess.user.isoperator,
                    localizationVal : req.body.lang,
                    localization : localization,
                    formData : formData,
                    originalUrl : req.originalUrl,
                    formDataJson : formData != null ? JSON.stringify(formData) : "''",
                    message : message
                });
    }

    function getReportModel(){
        var formData = {};
        formData.company = "";
        formData.customerCode = "";
        formData.forteCoatProductCode = "";
        formData.amount = "";
        formData.report = "";
        formData.batchNo = "";
        formData.reportData = "";
        formData.orderNo = "";
        formData.preparedBy = "";
        formData.controlledBy = "";
        formData.details = [];
        return formData;
    }

    function getDetails(req, res, sess, formData){
        var id = req.query.id;
        con.query("SELECT id, analysis, amount FROM qualityfollowup where id = " + id,
        function(err, result, fields){
            if(err){
                throw err;
            }
            var followup = result[0];
            con.query("SELECT id FROM analysisheader where id = " + followup.analysis,
            function(err, result, fields){
                if(err){
                    throw err;
                }
                var analysis = result[0];
                con.query("SELECT analysisdetail.header, material.short, material.name, analysisdetail.id, analysisdetail.material, max, min, master as master_alloy FROM analysisdetail" +
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
                                        details[i].master_alloy_result = parseFloat(parseFloat(details[i].master_alloy_result +result[y].result).toFixed(2));
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
                                                details[i].analysis_result = parseFloat(parseFloat(details[i].analysis_result + result[y].result).toFixed(2));
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
                                        details[i].amount = parseFloat(parseFloat((followup.amount / 100) * details[i].analysis_result_real).toFixed(2));
                                        details[i].fullAmount = parseFloat(parseFloat(followup.amount).toFixed(2));
                                        details[i].addedAmount = parseFloat(0);
                                        details[i].newResult = parseFloat(parseFloat(details[i].analysis_result_real).toFixed(2));
                                        var detail = {};
                                        detail.id = details[i].id;
                                        detail.header = details[i].header;
                                        //detail.composition = details[i].name;
                                        detail.request = "%" + details[i].min + " - " + "%" + details[i].max;
                                        detail.result = "%" + details[i].analysis_result_real;
                                        detail.composition = details[i].short + " (%)";
                                        formData.details.push(detail);
                                    }
                                    formData.followupid = id;
                                    formData.analysisheaderid = analysis.id;
                                    renderPage(req, res, sess, formData, ""); 
                                });
                            });
                        });
                    });
                });
                
            });                    
        });
    }

    function saveReport(req, res, sess, formData){
        var id = req.query.id;
        var sql = 
        "INSERT INTO reportheader (" + 

        " company," + 
        " customercode," + 
        " fortecoatproductcode," + 
        " amount," + 
        " report," + 
        " batchno," + 
        " reportdata," + 
        " orderno," + 
        " preparedby," + 
        " controlledby," + 
        " analysisheaderid," + 
        " archived," +
        " followupid," + 

        " added_by," + 
        " added_at," + 
        " is_deleted," + 
        " is_validated" + 

        ") VALUES" + 
        "(" +

        "'" + formData.company + "', " +
        "'" + formData.customerCode + "', " +
        "'" + formData.forteCoatProductCode + "', " +
        "'" + formData.amount + "', " +
        "'" + formData.report + "', " +
        "'" + formData.batchNo + "', " +
        "'" + formData.reportData + "', " +
        "'" + formData.orderNo + "', " +
        "'" + formData.preparedBy + "', " +
        "'" + formData.controlledBy + "', " +
        "" + formData.analysisheaderid + ", " +
        "" + "0" + ", " +
        "" + formData.followupid + ", " +

        "" + sess.user.id + ", " +
        "" + con.escape(new Date()) + ", " +
        "" + "0" + ", " +
        "" + "1" + 

        ");" ;

        con.query(sql, 
            function(err, result, fields){
                for(var i = 0; i < formData.details.length; i++){
                    con.query(getDetailSql(result.insertId, formData.details[i]), function(err, result, fields){});
                }
                var sql = "update qualityfollowup set isreported = 1 where id =" + id;
                con.query(sql, function(err, result, fields){});
                res.redirect('/qaprintreport') 
            }
        );
    }

    function getDetailSql(headerid, detail){
        var sql = 
        "INSERT INTO reportdetail (" + 

        " headerid," + 
        " analysisheaderid," + 
        " analysisdetailid," + 
        " composition," + 
        " request," + 
        " result," + 

        " added_by," + 
        " added_at," + 
        " is_deleted," + 
        " is_validated" + 

        ") VALUES" + 
        "(" +

        "" + headerid + ", " +
        "" + detail.header + ", " +
        "" + detail.id + ", " +
        "'" + detail.composition + "', " +
        "'" + detail.request + "', " +
        "'" + detail.result + "', " +

        "" + sess.user.id + ", " +
        "" + con.escape(new Date()) + ", " +
        "" + "0" + ", " +
        "" + "1" + 

        ");" ;
        return sql;
    }

    function checkValues(formData){
        if(
            formData.company ||
            formData.forteCoatProductCode ||
            formData.amount ||
            formData.report ||
            formData.batchNo ||
            formData.reportData ||
            formData.orderNo ||
            formData.preparedBy ||
            formData.controlledBy
        ){
            return false;
        }
        return true;
    }

    return module;
}
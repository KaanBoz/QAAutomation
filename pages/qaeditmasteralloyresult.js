module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaeditmasteralloyresult', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var id = req.query.id;
        var sess = req.session;
        var operation = req.query.operation;
        var message = "";
        var success = 0;
        var actionButton = 1;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                con.query("SELECT qualityfollowup.id, name, analysis, partyno, partydate, sender, explanation, " + 
                "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " + 
                "where qualityfollowup.id = " + id, function(err, result, fields){
                    if (err){
                        console.log(err.message);
                        throw err;    
                    }else{
                        var qfu = result[0];
                        var analysisId = result[0].analysis;
                        qfu.partydate = getFormattedDate(qfu.partydate);
                        con.query("select analysisheader.details, analysisheader.master_alloy from analysisheader where analysisheader.id = " + analysisId, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                throw err;    
                            }else{
                                var details = result[0].details;
                                var master_alloy = result[0].master_alloy;
                                con.query(
                                    " select analysisdetail.id as id, material.id as materialid, material.name as materialname, unittype.name as unitname, unittype.short as unitshort, " + 
                                    " analysisdetail.max as max, analysisdetail.min as min from analysisdetail" + 
                                    " inner join material on material.id = analysisdetail.material" +
                                    " inner join unittype on unittype.id = material.unit" +
                                    " where analysisdetail.id in (" + details + ")", function(err, result, fields){
                                    if (err){
                                        console.log(err.message);
                                        throw err;    
                                    }else{
                                        var values = result;
                                        if(operation == "add"){
                                            var fieldValues = [];
                                            for(var i = 0; i < values.length; i++){
                                                var field = {};
                                                field.id = values[i].id;
                                                field.materialid = values[i].materialid;
                                                field.materialname = values[i].materialname;
                                                field.unitname = values[i].unitname;
                                                field.unitshort = values[i].unitshort;
                                                field.max = values[i].max;
                                                field.min = values[i]. min;
                                                //field.master_alloy = master_alloy.split(",")[i]
                                                for(var j = 0; j < details.split(",").length; j++){
                                                    if(details.split(",")[j] == field.id){
                                                        field.master_alloy = master_alloy.split(",")[j]
                                                    }
                                                }
                                                fieldValues.push(field);
                                            }
                                            renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                            return;
                                        }else{
                                            var resultId = req.query.resultId;
                                            con.query(
                                                "select result from masteralloyresult where id = " + resultId, function(err, result, fields){
                                                    resultValues = result[0].result;
                                                    var fieldValues = [];
                                                    for(var i = 0; i < values.length; i++){
                                                        var field = {};
                                                        field.materialid = values[i].materialid;
                                                        field.materialname = values[i].materialname;
                                                        field.unitname = values[i].unitname;
                                                        field.unitshort = values[i].unitshort;
                                                        field.max = values[i].max;
                                                        field.min = values[i]. min;
                                                        field.master_alloy = master_alloy.split(",")[i]
                                                        field.value = resultValues.split(",")[i];
                                                        fieldValues.push(field);
                                                    }
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                            });
                                        }
                                        
                                    }  
                                });
                            }
                        });                           
                    }
                });  
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    app.post('/qaeditmasteralloyresult', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var results = req.body.results;
        var id = req.query.id;
        var sess = req.session;
        var operation = req.query.operation;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                con.query("SELECT qualityfollowup.id, name, analysis, partyno, partydate, sender, explanation, " + 
                "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " + 
                "where qualityfollowup.id = " + id, function(err, result, fields){
                    if (err){
                        console.log(err.message);
                        throw err;    
                    }else{
                        var qfu = result[0];
                        var analysisId = result[0].analysis;
                        qfu.partydate = getFormattedDate(qfu.partydate);
                        con.query("select analysisheader.details, analysisheader.master_alloy from analysisheader where analysisheader.id = " + analysisId, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                throw err;    
                            }else{
                                var details = result[0].details;
                                var master_alloy = result[0].master_alloy;
                                con.query(
                                    " select analysisdetail.id as id, material.id as materialid, material.name as materialname, unittype.name as unitname, unittype.short as unitshort, " + 
                                    " analysisdetail.max as max, analysisdetail.min as min from analysisdetail" + 
                                    " inner join material on material.id = analysisdetail.material" +
                                    " inner join unittype on unittype.id = material.unit" +
                                    " where analysisdetail.id in (" + details + ")", function(err, result, fields){
                                    if (err){
                                        console.log(err.message);
                                        throw err;    
                                    }else{
                                        var fieldValues = [];
                                        for(var i = 0; i < result.length; i++){
                                            var field = {};
                                            field.id = values[i].id;
                                            field.materialid = result[i].materialid;
                                            field.materialname = result[i].materialname;
                                            field.unitname = result[i].unitname;
                                            field.unitshort = result[i].unitshort;
                                            field.max = result[i].max;
                                            field.min = result[i]. min;
                                            //field.master_alloy = master_alloy.split(",")[i]
                                            for(var j = 0; j < details.split(",").length; j++){
                                                if(details.split(",")[j] == field.id){
                                                    field.master_alloy = master_alloy.split(",")[j]
                                                }
                                            }
                                            field.value = results[i];
                                            fieldValues.push(field);
                                        }
                                        var message = "";
                                        var success = 0;
                                        var actionButton = 1;
                                        if(operation == "add"){
                                            con.query(
                                                "insert into masteralloyresult (analysis, followup, result, added_by, added_at, is_deleted" + 
                                                ", is_validated) VALUES" + 
                                                "('" + analysisId + "', " + id + ", '" + results + "', " + sess.user.id + ", " 
                                                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    success = 1;
                                                    actionButton = 0;
                                                    message = localization.saved;
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                                });
                                        }else if(operation == "edit"){
                                            var resultId = req.query.resultId;
                                            con.query(
                                                "update masteralloyresult " + 
                                                " set result='" + results + "'," + 
                                                "edited_by=" + sess.user.id + "," +
                                                "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                                                "where id=" + resultId   , function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    success = 1;
                                                    actionButton = 0;
                                                    message = localization.saved;
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                                });
                                        }else if(operation == "delete"){
                                            var resultId = req.query.resultId;
                                            con.query(
                                                "update masteralloyresult " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                                                "where id=" + resultId  ,
                                                function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    success = 1;
                                                    message = localization.deleted;
                                                    actionButton = 0;
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                            });
                                        }else if(operation == "view"){

                                        }
                                        
                                    }  
                                });
                            }
                        });                           
                    }
                });
                
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    function getFormattedDate(date) {
        var year = date.getFullYear();
      
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
      
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        return day + '/' + month + '/' + year;
      }

      function renderPage(req, res, sess, qfu, fields, field, id, actionButton, operation, success, message){
        res.render('qaeditmasteralloyresult', 
        { 
            data: req.body,
            localization : localization,
            userName : functions.capitalizeFirstLetter(sess.user.firstname),
            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
            isAdmin : sess.user.isadmin,
            isChef : sess.user.ischef,
            isOperator : sess.user.isoperator,
            localizationVal : req.body.lang,
            qfu : qfu,
            fields : JSON.stringify(fields),
            field : fields,
            id : id,
            actionButton : actionButton,
            operation : operation,
            isDisabled : ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" || operation == "view" ? 1 : 0,
            success : success,
            message : message
        });
        return;
      }
    return module;
}
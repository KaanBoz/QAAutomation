module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaeditresult', function (req, res) {
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
                        con.query("select id, master from analysisdetail where header = " + analysisId, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                throw err;    
                            }else{
                                var details = "";
                                var master_alloy = "";
                                for(var i = 0; i < result.length; i++){
                                    if(!master_alloy){
                                        master_alloy += result[i].master;
                                    }else{
                                        master_alloy += "," + result[i].master;
                                    }
                                    if(!details){
                                        details += result[i].id;
                                    }else{
                                        details += "," + result[i].id;
                                    }
                                }
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
                                                "select result, detailid from analysisresultdetails where is_deleted = 0 and analysisresult = " + resultId, function(err, result, fields){
                                                    var fieldValues = [];
                                                    if(result){
                                                        for(var i = 0; i < values.length; i++){
                                                            var field = {};
                                                            field.materialid = values[i].materialid;
                                                            field.materialname = values[i].materialname;
                                                            field.unitname = values[i].unitname;
                                                            field.unitshort = values[i].unitshort;
                                                            field.max = values[i].max;
                                                            field.min = values[i]. min;
                                                            field.master_alloy = master_alloy.split(",")[i]
                                                            for(var k = 0; k < result.length; k++){
                                                                if(result[k].detailid == field.materialid){
                                                                    field.value = {};
                                                                    field.value.value = result[k].result;
                                                                }
                                                            }
                                                            fieldValues.push(field);
                                                        }
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

    app.post('/qaeditresult', function (req, res) {
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
                        con.query("select id, master from analysisdetail where header = " + analysisId, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                throw err;    
                            }else{
                                var details = "";
                                var master_alloy = "";
                                for(var i = 0; i < result.length; i++){
                                    if(!master_alloy){
                                        master_alloy += result[i].master;
                                    }else{
                                        master_alloy += "," + result[i].master;
                                    }
                                    if(!details){
                                        details += result[i].id;
                                    }else{
                                        details += "," + result[i].id;
                                    }
                                }
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
                                            field.id = result[i].id;
                                            field.materialid = result[i].materialid;
                                            field.materialname = result[i].materialname;
                                            field.unitname = result[i].unitname;
                                            field.unitshort = result[i].unitshort;
                                            field.max = result[i].max;
                                            field.min = result[i]. min;
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
                                                "insert into analysisresult (analysis, followup, added_by, added_at, is_deleted" + 
                                                ", is_validated) VALUES" + 
                                                "('" + analysisId + "', " + id + ", " + sess.user.id + ", " 
                                                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    saveDetails(fieldValues, result.insertId)
                                                    success = 1;
                                                    actionButton = 0;
                                                    message = localization.saved;
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                                });
                                        }else if(operation == "edit"){
                                            var resultId = req.query.resultId;
                                            con.query(
                                                "update analysisresult set " + 
                                                "edited_by=" + sess.user.id + "," +
                                                "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                                                "where id=" + resultId   , function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    saveDetails(fieldValues, resultId)
                                                    success = 1;
                                                    actionButton = 0;
                                                    message = localization.saved;
                                                    renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                    return;
                                                });
                                        }else if(operation == "delete"){
                                            var resultId = req.query.resultId;
                                            con.query(
                                                "update analysisresult " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                                                "where id=" + resultId  ,
                                                function(err, result, fields){
                                                    if(err){
                                                        message = err.message;
                                                        renderPage(req, res, sess, qfu, fieldValues, field, id, actionButton, operation, success, message);
                                                        return
                                                    }
                                                    saveDetails(null, resultId)
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
        var localizationJson = {};
        if(localization != null){
            if(typeof localization == "string" ){
                localizationJson = localization.split(",");
            }else{
                localizationJson = localization;
            }
        }
        res.render('qaeditresult', 
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
            message : message,
            localizationJson : JSON.stringify(localizationJson)
        });
        return;
      }

      function saveDetails(detail, headerId){
        removeDetails(headerId);
        if(detail){
            for(var i = 0; i < detail.length; i++){
                con.query("INSERT INTO analysisresultdetails (analysisresult, detailid, result, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "(" + headerId + ", " + detail[i].id + ", " + detail[i].value.value + ", "
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

    function removeDetails(headerId){
        con.query("UPDATE analysisresultdetails SET is_deleted = 1 where analysisresult=" + headerId, function(err, result, fields){
            if (err){
                message = err.message;
                return;    
            }
            return;
        });
    }
    
    return module;
}
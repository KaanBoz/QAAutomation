module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaanalysistypeoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    renderQaAnalysisTypeOperation(req, res, sess, null, null, 1, operation, null);
                    return;
                }else if(operation == "edit"){
                    con.query("select name from analysistype where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.analysisTypeExists;
                            }
                            success = 0;
                            renderQaAnalysisTypeOperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;;
                        renderQaAnalysisTypeOperation(req, res, sess, null, null, 1, operation, formData);
                    });
                    return;

                }else if (operation == "delete"){
                    con.query("select name from analysistype where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.analysisTypeExists;
                            }
                            success = 0;
                            renderQaAnalysisTypeOperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;
                        renderQaAnalysisTypeOperation(req, res, sess, null, null, 1, operation, formData);

                    });
                    return;
                }else if(operation =="view"){

                    con.query("select name from analysistype where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.analysisTypeExists;
                            }
                            success = 0;
                            renderQaAnalysisTypeOperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;
                        renderQaAnalysisTypeOperation(req, res, sess, null, null, 0, operation, formData);
                    });
                    return;
                }
                else{
                    res.redirect('/notfound');
                    return;
                }
            }else if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                res.redirect('/permissiondenied')
                return;
            }else {
                res.redirect('/notfound');
                return;
            }          
        }else{
            res.redirect('/');
        }
    });

    app.post('/qaanalysistypeoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess.user.ischef){
                var operation = req.query.operation;
                if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                    //get the variables from the request
                    var name = req.body.name;
                    //set form data
                    var formData = [];
                    formData.name = name;
                    //set the message and success
                    var message = "";
                    var success = 0;
                    var actionButton = 1;
                    if(operation == "add"){
                        if(validations(req, res, sess, name, message, success, operation, actionButton, formData)){
                            return;
                        }
                        con.query("select id from analysistype where name like '" + name + "' and is_deleted = 1", function(err, result, fields){
                            if(err){
                                message = err.message;
                                renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length > 0){
                                var id = result[0].id;
                                con.query(
                                    "update analysistype " + " set name='" + name + "'," + 
                                    "edited_by=" + sess.user.id + "," +
                                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                                    "where id=" + id  ,
                                    function(err, result, fields){
                                        if(err){
                                            message = err.message;
                                            renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                            return
                                        }
                                        success = 1;
                                        message = localization.userCreated;
                                        actionButton = 0;
                                        renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return;
                                });
                            }else{
                                con.query("INSERT INTO analysistype (name, added_by, added_at, is_deleted" + 
                                ", is_validated) VALUES" + 
                                "('" + name + "', " + sess.user.id + ", " 
                                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                    if (err){
                                        message = err.message;
                                        if(message.indexOf("Duplicate entry") > -1) {
                                            message = localization.analysisTypeExists;
                                        }
                                        success = 0;
                                        renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return;    
                                    }
                                    success = 1;
                                    message = localization.analysisTypeCreated;
                                    actionButton = 0;
                                    renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                    return;
                                });
                            }
                        });
                    }else if(operation == "edit"){
                        var id = req.query.id;
                        if(!id){
                            res.redirect('/notfound');
                            return;
                        }
                        con.query("select id from analysistype where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length == 0){
                                message = localization.analysisTypeWasNotFound;
                                renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(validations(req, res, sess, name, message, success, operation, actionButton, formData)){
                                return;
                            }
                            con.query(
                                "update analysistype " + " set name='" + name + "', edited_by=" + sess.user.id + "," +
                                "edited_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return
                                    }
                                    success = 1;
                                    message = localization.analysisTypeUpdated;
                                    actionButton = 0;
                                    renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                    return;
                            });
                        });
                    }else if(operation == "delete"){
                        var id = req.query.id;
                        if(!id){
                            res.redirect('/notfound');
                            return;
                        }
                        con.query("select id from analysistype where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length == 0){
                                message = localization.userWasNotFound;
                                renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            con.query(
                                "update analysistype " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return
                                    }
                                    success = 1;
                                    message = localization.analysisTypeDeleted;
                                    actionButton = 0;
                                    renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
                                    return;
                            });
                        });

                    }
                }else {
                    res.redirect('/notfound');
                    return;
                }
            }else if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                res.redirect('/permissiondenied')
                return;
            }else {
                res.redirect('/notfound');
                return;
            }
        }else{
            res.redirect('/');
            return;
        }
    });

    function renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        res.render('qaanalysistypeoperation', 
                { 
                    data: req.body,
                    success : success,
                    message : message,
                    userName : functions.capitalizeFirstLetter(sess.user.firstname),
                    userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                    isAdmin : sess.user.isadmin,
                    isChef : sess.user.ischef,
                    isOperator : sess.user.isoperator,
                    localizationVal : req.body.lang,
                    localization : localization,
                    actionButton : actionButton,
                    operation : operation,
                    isDisabled : ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" || operation == "view" ? 1 : 0,
                    formData : formData,
                    originalUrl : req.originalUrl
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess,name, message, success, operation, actionButton, formData){
        //validations
        if(!name){
            message = addMessage(message, localization.fillForm)
        }
        if(message){
            renderQaAnalysisTypeOperation(req, res, sess, success, message, actionButton, operation, formData);
            return true;
        }
        return false;
    }



    return module;
}



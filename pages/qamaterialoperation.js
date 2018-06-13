module.exports = function (app, myLocalize, functions, con, router, localization) {


    function getUnitTypes(operation, req, res, unittypes){
        con.query("select id, name, short from unittype where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    unittypes = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var type = {};
                        type.id = result[i].id;
                        type.name = result[i].name;
                        unittypes.push(type);
                    }
                }
                operation(req, res, unittypes);
            }
        );
    }

    function operationGet(req, res, unittypes){
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
                    renderPage(req, res, sess, null, null, 1, operation, null, unittypes);
                    return;
                }else if(operation == "edit"){
                    con.query("select name, unit, is_multiple from material where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.materialExists;
                            }
                            success = 0;
                            renderPage(req, res, sess, success, message, 0, operation, null, unittypes);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;
                        formData.unittype = result[0].unit;
                        formData.isMultiple = result[0].is_multiple;
                        renderPage(req, res, sess, null, null, 1, operation, formData, unittypes);
                    });
                    return;

                }else if (operation == "delete"){
                    con.query("select name, unit, is_multiple from material where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.materialExists;
                            }
                            success = 0;
                            renderPage(req, res, sess, success, message, 0, operation, null, unittypes);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;
                        formData.unittype = result[0].unit;
                        formData.isMultiple = result[0].is_multiple;
                        renderPage(req, res, sess, null, null, 1, operation, formData, unittypes);

                    });
                    return;
                }else if(operation =="view"){

                    con.query("select name, unit, is_multiple from material where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.materialExists;
                            }
                            success = 0;
                            renderPage(req, res, sess, success, message, 0, operation, null, unittypes);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.name = result[0].name;
                        formData.unittype = result[0].unit;
                        formData.isMultiple = result[0].is_multiple;
                        renderPage(req, res, sess, null, null, 0, operation, formData, unittypes);
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
    }

    function operationPost(req, res, unittypes){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess.user.ischef){
                var operation = req.query.operation;
                if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                    //get the variables from the request
                    var name = req.body.name;
                    var unittype = req.body.unittype;
                    var isMultiple = req.body.isMultiple;
                    //set form data
                    var formData = [];
                    formData.name = name;
                    formData.unittype = unittype;
                    formData.isMultiple = isMultiple;
                    //set the message and success
                    var message = "";
                    var success = 0;
                    var actionButton = 1;
                    if(operation == "add"){
                        if(validations(req, res, sess, name, unittype, message, success, operation, actionButton, formData, unittypes)){
                            return;
                        }
                        con.query("select id from material where name like '" + name + "' and unit like " + unittype + " and is_deleted = 1", function(err, result, fields){
                            if(err){
                                message = err.message;
                                renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                return
                            }
                            if(result.length > 0){
                                var id = result[0].id;
                                con.query(
                                    "update material " + " set name='" + name + "', unit=" + unittype + ", is_multiple=" + formData.isMultiple + ", " + 
                                    "edited_by=" + sess.user.id + "," +
                                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                                    "where id=" + id  ,
                                    function(err, result, fields){
                                        if(err){
                                            message = err.message;
                                            renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                            return
                                        }
                                        success = 1;
                                        message = localization.materialCreated;
                                        actionButton = 0;
                                        renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                        return;
                                });
                            }else{
                                con.query("INSERT INTO material (name, unit, is_multiple, added_by, added_at, is_deleted" + 
                                ", is_validated) VALUES" + 
                                "('" + name + "', '" + unittype + "'," + formData.isMultiple + ", " + sess.user.id + ", " 
                                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                    if (err){
                                        message = err.message;
                                        if(message.indexOf("Duplicate entry") > -1) {
                                            message = localization.materialExists;
                                        }
                                        success = 0;
                                        renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                        return;    
                                    }
                                    success = 1;
                                    message = localization.materialCreated;
                                    actionButton = 0;
                                    renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
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
                        con.query("select id from material where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                return
                            }
                            if(result.length == 0){
                                message = localization.materialWasNotFound;
                                renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                return
                            }
                            if(validations(req, res, sess, name, unittype, message, success, operation, actionButton, formData)){
                                return;
                            }
                            con.query(
                                "update material " + " set name='" + name + "', unit=" + unittype + ", is_multiple=" + formData.isMultiple + ", edited_by=" + sess.user.id + "," +
                                "edited_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                        return
                                    }
                                    success = 1;
                                    message = localization.materialUpdated;
                                    actionButton = 0;
                                    renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                    return;
                            });
                        });
                    }else if(operation == "delete"){
                        var id = req.query.id;
                        if(!id){
                            res.redirect('/notfound');
                            return;
                        }
                        con.query("select id from material where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                return
                            }
                            if(result.length == 0){
                                message = localization.materialWasNotFound;
                                renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                return
                            }
                            con.query(
                                "update material " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
                                        return
                                    }
                                    success = 1;
                                    message = localization.materialDeleted;
                                    actionButton = 0;
                                    renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
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
    }

    app.get('/qamaterialoperation', function (req, res) {
        var unittypes = [];
        getUnitTypes(operationGet, req, res, unittypes);
    });

    app.post('/qamaterialoperation', function (req, res){
        var unittypes = [];
        getUnitTypes(operationPost, req, res, unittypes);
    });

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes){
        if(formData && formData.isMultiple && formData.isMultiple == "true"){
            formData.isMultiple = true;
        }
        res.render('qamaterialoperation', 
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
                    originalUrl : req.originalUrl,
                    unitTypes : unittypes
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess, name, unittype, message, success, operation, actionButton, formData, unittypes){
        //validations
        if(!name || !unittype){
            message = addMessage(message, localization.fillForm)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, unittypes);
            return true;
        }
        return false;
    }



    return module;
}



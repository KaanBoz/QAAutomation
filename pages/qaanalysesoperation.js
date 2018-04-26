module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getAnalysisTypes(getStandarts, operation, req, res, sess, standarts, types){
        con.query("select id,name from analysistype where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    types = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var type = {};
                        type.id = result[i].id;
                        type.name = result[i].name;
                        types.push(type);
                    }
                }
                getStandarts(operation, req, res, sess, standarts, types);
            }
        );
    }

    function getStandarts(operation, req, res, sess, standarts, types){
        con.query("select id, name from analysisstandart where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    //an error occured, we are setting standarts to empty array
                    standarts = []
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var standart = {};
                        standart.id = result[i].id;
                        standart.name = result[i].name;
                        standarts.push(standart);
                    }
                }
                operation(req, res, sess, standarts, types);        
            }
        );
    }

    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, standarts, types, id){
        renderPage(req, res, sess, null, null, 1, operation, null, standarts, types);
    }

    function getEdit(req, res, sess, operation, standarts, types, id){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.name = result[0].name;
                formData.type = result[0].type;
                formData.standart = result[0].standart;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types);
        });
    }

    function getDelete(req, res, sess, operation, standarts, types, id){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.name = result[0].name;
                formData.type = result[0].type;
                formData.standart = result[0].standart;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types);
            });
    }

    function getView(req, res, sess, operation, standarts, types, id){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.name = result[0].name;
                formData.type = result[0].type;
                formData.standart = result[0].standart;
                renderPage(req, res, sess, null, null, 0, operation, formData, standarts, types);
            });
    }

    function getOperation(req, res, sess, standarts, types){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, standarts, types, id);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, standarts, types, id);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, standarts, types, id);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, standarts, types, id);
                    return;
                }else{
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
    }

    // APP METHODS

    app.get('/qaanalysesoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            getAnalysisTypes(getStandarts, getOperation, req, res, sess, standarts, types);
        }else{
            res.redirect('/');
        }    
    });

    app.post('/qaanalysesoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            getAnalysisTypes(getStandarts, postOperation, req, res, sess, standarts, types);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton){
        if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types)){
            return;
        }
        con.query("select id from analysisheader where name like '" + name + "' and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                return
            }
            if(result.length > 0){
                var id = result[0].id;
                con.query(
                    "update analysisheader " + " set name='" + name + "'," + 
                    "type =" + type + "," +
                    "standart =" + standart + "," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id  ,
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                            return
                        }
                        success = 1;
                        message = localization.analysisCreated;
                        actionButton = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                        return;
                });
            }else{
                con.query("INSERT INTO analysisheader (name, type, standart, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "('" + name + "', " + type + ", " + standart + ", " + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                    if (err){
                        message = err.message;
                        if(message.indexOf("Duplicate entry") > -1) {
                            message = localization.analysisExists;
                        }
                        success = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts, types);
                        return;    
                    }
                    success = 1;
                    message = localization.analysisCreated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts,types);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                return
            }
            if(result.length == 0){
                message = localization.analysisWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                return
            }
            if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types)){
                return;
            }
            con.query(
                "update analysisheader " + " set name='" + name + "'," + 
                "type =" + type + "," +
                "standart =" + standart + "," +
                "edited_by=" + sess.user.id + "," +
                "edited_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                        return
                    }
                    success = 1;
                    message = localization.analysisUpdated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                return
            }
            if(result.length == 0){
                message = localization.analysisWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                return
            }
            con.query(
                "update analysisheader " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                        return
                    }
                    success = 1;
                    message = localization.analysisDeleted;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, standarts, types){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //get the variables from the request
                var name = req.body.name;
                var type = req.body.type;
                var standart = req.body.standart;
                //set form data
                var formData = [];
                formData.name = name;
                formData.type = type;
                formData.standart = standart;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton);
                }
            }else{
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
    }

    //METHODS

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        res.render('qaanalysesoperation', 
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
                    standarts : standarts,
                    types : types
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess,name, message, success, operation, actionButton, formData, standarts, types){
        //validations
        if(!name || !formData.type || !formData.standart){
            message = addMessage(message, localization.fillForm)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types);
            return true;
        }
        return false;
    }

    return module;
}





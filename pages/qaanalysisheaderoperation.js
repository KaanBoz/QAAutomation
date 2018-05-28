module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getDetails(operation, req, res, sess, standarts, types, details){
        con.query(
        " select " +
            " analysisdetail.id as id, " +
            " CONCAT(material.name, ' (',unittype.name, '-', unittype.short, ')', ' (', analysisdetail.min, '-', analysisdetail.max , ')') as name " +
        " from analysisdetail " +
        " inner join material on  material.id=analysisdetail.material " +
        " inner join unittype on unittype.id=material.unit " , 
            function(err, result, fields){
                if(err){
                    types = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var detail = {};
                        detail.id = result[i].id;
                        detail.name = result[i].name;
                        details.push(detail);
                    }
                }
                getAnalysisTypes(operation, req, res, sess, standarts, types, details);
            }
        );
    }

    function getAnalysisTypes(operation, req, res, sess, standarts, types, details){
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
                getStandarts(operation, req, res, sess, standarts, types, details);
            }
        );
    }

    function getStandarts(operation, req, res, sess, standarts, types, details){
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
                operation(req, res, sess, standarts, types, details);        
            }
        );
    }

    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, standarts, types, id, details){
        renderPage(req, res, sess, null, null, 1, operation, null, standarts, types, details);
    }

    function getEdit(req, res, sess, operation, standarts, types, id, details){
        con.query("select name, type, standart, details, master_alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details);
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
                formData.detail = result[0].details;
                formData.masterAlloys = result[0].master_alloy;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details);
        });
    }

    function getDelete(req, res, sess, operation, standarts, types, id, details){
        con.query("select name, type, standart, details, master_alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details);
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
                formData.detail = result[0].details;
                formData.masterAlloys = result[0].master_alloy;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details);
            });
    }

    function getView(req, res, sess, operation, standarts, types, id, details){
        con.query("select name, type, standart, details, master_alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details);
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
                formData.detail = result[0].details;
                formData.masterAlloys = result[0].master_alloy;
                renderPage(req, res, sess, null, null, 0, operation, formData, standarts, types, details);
            });
    }

    function getOperation(req, res, sess, standarts, types, details){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, standarts, types, id, details);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, standarts, types, id, details);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, standarts, types, id, details);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, standarts, types, id, details);
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

    app.get('/qaanalysisheaderoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            var details = [];
            getDetails(getOperation, req, res, sess, standarts, types, details);
        }else{
            res.redirect('/');
        }    
    });

    app.post('/qaanalysisheaderoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            var details = [];
            getDetails(postOperation, req, res, sess, standarts, types, details);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details){
        if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details)){
            return;
        }
        con.query("select id from analysisheader where name like '" + name + "' and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                return
            }
            if(result.length > 0){
                var id = result[0].id;
                con.query(
                    "update analysisheader " + " set name='" + name + "'," + 
                    "type =" + type + "," +
                    "details='" + formData.detail + "'," +
                    "master_alloy='" + formData.masterAlloys + "'," +
                    "standart =" + standart + "," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id  ,
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                            return
                        }
                        success = 1;
                        message = localization.analysisHeaderCreated;
                        actionButton = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                        return;
                });
            }else{
                con.query("INSERT INTO analysisheader (name, type, standart, details, master_alloy, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "('" + name + "', " + type + ", " + standart + ", '" + formData.detail + "', '" + formData.masterAlloys + "'," + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                    if (err){
                        message = err.message;
                        if(message.indexOf("Duplicate entry") > -1) {
                            message = localization.analysisHeaderExists;
                        }
                        success = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts, types, details);
                        return;    
                    }
                    success = 1;
                    message = localization.analysisHeaderCreated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts,types, details);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                return
            }
            if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details)){
                return;
            }
            con.query(
                "update analysisheader " + " set name='" + name + "'," + 
                "type =" + type + "," +
                "standart =" + standart + "," +
                "details='" + formData.detail + "'," +
                "master_alloy='" + formData.masterAlloys + "'," +
                "edited_by=" + sess.user.id + "," +
                "edited_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderUpdated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                return
            }
            con.query(
                "update analysisheader " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderDeleted;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, standarts, types, details){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //get the variables from the request
                var name = req.body.name;
                var type = req.body.type;
                var standart = req.body.standart;
                var detail = req.body.details;
                var masterAlloys = req.body.masterAlloys;
                //set form data
                var formData = [];
                formData.name = name;
                formData.type = type;
                formData.standart = standart;
                formData.detail = detail;
                formData.masterAlloys = masterAlloys;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details);
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

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        var detail = [];
        if(formData != null && formData.detail != null){
            if(typeof formData.detail == "string" ){
                detail = formData.detail.split(",");
            }else{
                detail = formData.detail;
            }
        }
        var masterAlloys = [];
        if(formData != null && formData.masterAlloys != null){
            if(typeof formData.masterAlloys == "string" ){
                masterAlloys = formData.masterAlloys.split(",");
            }else{
                masterAlloys = formData.masterAlloys;
            }
        }
        res.render('qaanalysisheaderoperation', 
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
                    types : types,
                    details : details,
                    detail : JSON.stringify(detail),
                    masterAlloys : JSON.stringify(masterAlloys)
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess,name, message, success, operation, actionButton, formData, standarts, types, details){
        //validations
        if(!name || !formData.type || !formData.standart || !formData.detail){
            message = addMessage(message, localization.fillForm)
        }
        var isError = false;
        for(var i = 0; i < formData.masterAlloys.length; i++){
            if(!formData.masterAlloys[i]){
                isError = true;
                break;
            }
        }
        if(isError){
            message = addMessage(message, localization.enterMasterAlloy)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details);
            return true;
        }
        return false;
    }

    return module;
}





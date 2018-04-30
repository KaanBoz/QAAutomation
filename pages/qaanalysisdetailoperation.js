module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getMaterials(getUnitTypes, operation, req, res, sess, materials){
        con.query("select id, name, unit from material where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    materials = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var material = {};
                        material.id = result[i].id;
                        material.name = result[i].name;
                        material.unit = result[i].unit;
                        material.unitname = "";
                        material.unitshort = "";
                        materials.push(material);
                    }
                }
                getUnitTypes(operation, req, res, sess, materials);
            }
        );
    }

    function getUnitTypes(operation, req, res, sess, materials){
        con.query("select id, name, short from unittype where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    //an error occured, we are setting standarts to empty array
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        for(var j = 0; j <  materials.length; j++){
                            if(result[i].id == materials[j].unit){
                                materials[j].unitname = result[i].name;
                                materials[j].unitshort = result[i].short;
                            }
                        }
                    }
                }
                operation(req, res, sess, materials);        
            }
        );
    }

    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, id, materials){
        renderPage(req, res, sess, null, null, 1, operation, null, materials);
    }

    function getEdit(req, res, sess, operation, id, materials){
        con.query("select material, max, min from analysisdetail where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisDetailExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, materials);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.material = result[0].material;
                formData.max = result[0].max;
                formData.min = result[0].min;
                renderPage(req, res, sess, null, null, 1, operation, formData, materials);
        });
    }

    function getDelete(req, res, sess, operation, id, materials){
        con.query("select material, max, min from analysisdetail where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisDetailExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, materials);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.material = result[0].material;
                formData.max = result[0].max;
                formData.min = result[0].min;
                renderPage(req, res, sess, null, null, 1, operation, formData, materials);
            });
    }

    function getView(req, res, sess, operation, id, materials){
        con.query("select material, max, min from analysisdetail where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisDetailExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, materials);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.material = result[0].material;
                formData.max = result[0].max;
                formData.min = result[0].min;
                renderPage(req, res, sess, null, null, 0, operation, formData, materials);
            });
    }

    function getOperation(req, res, sess, materials){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, id, materials);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, id, materials);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, id, materials);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, id, materials);
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

    app.get('/qaanalysisdetailoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            var materials = [];
            getMaterials(getUnitTypes, getOperation, req, res, sess, materials);
        }else{
            res.redirect('/');
        }    
    });

    app.post('/qaanalysisdetailoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            var materials = [];
            getMaterials(getUnitTypes, postOperation, req, res, sess, materials);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, formData, message, success, actionButton, materials){
        if(validations(req, res, sess, message, success, operation, actionButton, formData, materials)){
            return;
        }
        con.query("select id from analysisdetail where material=" + formData.material + " and max=" + formData.max + 
        " and min=" + formData.min + " and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                return
            }
            if(result.length > 0){
                var id = result[0].id;
                con.query(
                    "update analysisdetail " + " set material=" + formData.material + "," + 
                    "min =" + formData.min + "," +
                    "max =" + formData.max + "," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id  ,
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                            return
                        }
                        success = 1;
                        message = localization.analysisDetailCreated;
                        actionButton = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                        return;
                });
            }else{
                con.query("INSERT INTO analysisdetail (material, max, min, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "(" + formData.material + ", " + formData.max + ", " + formData.min + ", " + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                    if (err){
                        message = err.message;
                        if(message.indexOf("Duplicate entry") > -1) {
                            message = localization.analysisDetailExists;
                        }
                        success = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                        return;    
                    }
                    success = 1;
                    message = localization.analysisDetailCreated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, formData, message, success, actionButton, materials){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisdetail where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                return
            }
            if(result.length == 0){
                message = localization.analysisDetailWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                return
            }
            if(validations(req, res, sess, message, success, operation, actionButton, formData, materials)){
                return;
            }
            con.query(
                "update analysisdetail " + " set material=" + formData.material + "," + 
                "min =" + formData.min + "," +
                "max =" + formData.max + "," +
                "edited_by=" + sess.user.id + "," +
                "edited_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                        return
                    }
                    success = 1;
                    message = localization.analysisDetailUpdated;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, formData, message, success, actionButton, materials){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisdetail where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                return
            }
            if(result.length == 0){
                message = localization.analysisDetailWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                return
            }
            con.query(
                "update analysisdetail " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                        return
                    }
                    success = 1;
                    message = localization.analysisDetailDeleted;
                    actionButton = 0;
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, materials){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //get the variables from the request
                var material = req.body.material;
                var min = req.body.min;
                var max = req.body.max;
                //set form data
                var formData = [];
                formData.material = material;
                formData.min = min;
                formData.max = max;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, formData, message, success, actionButton, materials);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, formData, message, success, actionButton, materials);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, formData, message, success, actionButton, materials);
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

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, materials){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        res.render('qaanalysisdetailoperation', 
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
                    materials : materials,
                    material : (formData != null &&  formData.material != null ? formData.material : null)
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess, message, success, operation, actionButton, formData, materials){
        //validations
        if(!formData.material || !formData.max || !formData.min){
            message = addMessage(message, localization.fillForm)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, materials);
            return true;
        }
        return false;
    }

    return module;
}





module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getDetails(operation, req, res, sess, standarts, types, details, materials){
        var id = req.query.id;
        if(!id){
            id = -1;
        }
        con.query(
        " select " +
            " analysisdetail.id as id, " +
            " analysisdetail.max as max, " +
            " analysisdetail.min as min, " +
            " analysisdetail.master as master, " +
            " analysisdetail.material as material, " +
            " material.name as materialName " +
        " from analysisdetail " +
        " inner join material on  material.id=analysisdetail.material " +
        " inner join unittype on unittype.id=material.unit" + 
        " where analysisdetail.is_deleted = 0 and analysisdetail.header =" + id , 
            function(err, result, fields){
                if(err){
                    types = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var detail = {};
                        detail.id = result[i].id;
                        detail.isDeleted = false;
                        detail.materialId = result[i].material;
                        detail.material = result[i].materialName;
                        detail.min = result[i].min;
                        detail.max = result[i].max;
                        detail.master = result[i].master;
                        details.push(detail);
                    }
                }
                getAnalysisTypes(operation, req, res, sess, standarts, types, details, materials);
            }
        );
    }

    function getAnalysisTypes(operation, req, res, sess, standarts, types, details, materials){
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
                getStandarts(operation, req, res, sess, standarts, types, details, materials);
            }
        );
    }

    function getStandarts(operation, req, res, sess, standarts, types, details, materials){
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
                getMaterials(operation, req, res, sess, standarts, types, details, materials);        
            }
        );
    }

    function getMaterials(operation, req, res, sess, standarts, types, details, materials){
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
                getUnitTypes(operation, req, res, sess, standarts, types, details, materials);
            }
        );
    }

    function getUnitTypes(operation, req, res, sess, standarts, types, details, materials){
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
                operation(req, res, sess, standarts, types, details, materials);       
            }
        );
    }



    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, standarts, types, id, details, materials){
        renderPage(req, res, sess, null, null, 1, operation, null, standarts, types, details, materials);
    }

    function getEdit(req, res, sess, operation, standarts, types, id, details, materials){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials);
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
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details, materials);
        });
    }

    function getDelete(req, res, sess, operation, standarts, types, id, details, materials){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials);
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
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details, materials);
            });
    }

    function getView(req, res, sess, operation, standarts, types, id, details, materials){
        con.query("select name, type, standart from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials);
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
                renderPage(req, res, sess, null, null, 0, operation, formData, standarts, types, details, materials);
            });
    }

    function getOperation(req, res, sess, standarts, types, details, materials){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, standarts, types, id, details, materials);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, standarts, types, id, details, materials);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, standarts, types, id, details, materials);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, standarts, types, id, details, materials);
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
            var materials = [];
            getDetails(getOperation, req, res, sess, standarts, types, details, materials);
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
            var materials = [];
            getDetails(postOperation, req, res, sess, standarts, types, details, materials);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail){
        if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail)){
            return;
        }
        con.query("select id from analysisheader where name like '" + name + "' and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
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
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                            return
                        }
                        success = 1;
                        message = localization.analysisHeaderCreated;
                        actionButton = 0;
                        saveDetails(detail, id);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
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
                            message = localization.analysisHeaderExists;
                        }
                        success = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts, types, details, materials);
                        return;    
                    }
                    success = 1;
                    message = localization.analysisHeaderCreated;
                    actionButton = 0;
                    saveDetails(detail, result.insertId);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts,types, details, materials);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                return
            }
            if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail)){
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
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderUpdated;
                    actionButton = 0;
                    saveDetails(detail, id);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                return
            }
            con.query(
                "update analysisheader " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderDeleted;
                    actionButton = 0;
                    saveDetails(detail, id);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, standarts, types, details, materials){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //get the variables from the request
                var name = req.body.name;
                var type = req.body.type;
                var standart = req.body.standart;
                var detail = req.body.detail;
                //set form data
                var formData = [];
                formData.name = name;
                formData.type = type;
                formData.standart = standart;
                formData.detail = detail;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail);
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

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials){
        var detail = [];
        if(formData != null && formData.detail != null){
            if(typeof formData.detail == "string" ){
                detail = formData.detail.split(",");
            }else{
                detail = formData.detail;
            }
        }
        var material = [];
        if(materials != null){
            if(typeof materials == "string" ){
                material = materials.split(",");
            }else{
                material = materials;
            }
        }
        var localizationJson = {};
        if(localization != null){
            if(typeof localization == "string" ){
                localizationJson = localization.split(",");
            }else{
                localizationJson = localization;
            }
        }
        var detailsJson = [];
        if(details != null){
            if(typeof details == "string" ){
                detailsJson = details.split(",");
            }else{
                detailsJson = details;
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
                    detailsJson : JSON.stringify(detailsJson),
                    details : details,
                    detail : JSON.stringify(detail),
                    material : JSON.stringify(material),
                    localizationJson : JSON.stringify(localizationJson),
                    formDataJsonName : formData != null && formData.name != null ? JSON.stringify(formData.name) : "''",
                    formDataJsonType : formData != null && formData.type != null ? JSON.stringify(formData.type) : "''",
                    formDataJsonStandart : formData != null && formData.standart != null ? JSON.stringify(formData.standart) : "''",
                    materials : materials,
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess,name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail){
        //validations
        if(!name || !formData.type || !formData.standart){
            message = addMessage(message, localization.fillForm)
        }
        if(!detail){
            message = addMessage(message, localization.mustAddDetail)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials);
            return true;
        }
        return false;
    }

    function saveDetails(detail, headerId){
        removeDetails(headerId);
        if(detail){
            for(var i = 0; i < detail.length; i++){
                con.query("INSERT INTO analysisdetail (material, max, min, master, header, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "(" + detail[i].materialId + ", " + detail[i].max + ", " + detail[i].min + ", " + detail[i].master + ", " + headerId + ", " 
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
        con.query("UPDATE analysisdetail SET is_deleted = 1 where header=" + headerId, function(err, result, fields){
            if (err){
                message = err.message;
                return;    
            }
            return;
        });
    }

    return module;
}





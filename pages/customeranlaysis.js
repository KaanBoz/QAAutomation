module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getDetails(operation, req, res, sess, standarts, types, details, materials, analyses, customers, shouldReturn){
        var id = req.query.id;
        if(shouldReturn){
            id = req.body.id;
        }
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
                if(shouldReturn){
                    res.send(details);
                }else{
                    getAnalysisTypes(operation, req, res, sess, standarts, types, details, materials, analyses, customers);
                }
                
            }
        );
    }

    function getAnalysisTypes(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
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
                getStandarts(operation, req, res, sess, standarts, types, details, materials, analyses, customers);
            }
        );
    }

    function getStandarts(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
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
                getMaterials(operation, req, res, sess, standarts, types, details, materials, analyses, customers);        
            }
        );
    }

    function getMaterials(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
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
                getUnitTypes(operation, req, res, sess, standarts, types, details, materials, analyses, customers);
            }
        );
    }

    function getUnitTypes(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
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
                getAnalyses(operation, req, res, sess, standarts, types, details, materials, analyses, customers);       
            }
        );
    }

    function getAnalyses(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
        con.query("SELECT id, name FROM analysisheader where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    analyses = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var analysis = {};
                        analysis.id = result[i].id;
                        analysis.name = result[i].name;
                        analyses.push(analysis);
                    }
                }
                getCustomers(operation, req, res, sess, standarts, types, details, materials, analyses, customers);
            }
        );
    }

    function getCustomers(operation, req, res, sess, standarts, types, details, materials, analyses, customers){
        con.query("SELECT id, customername FROM customer where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    customers = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var customer = {};
                        customer.id = result[i].id;
                        customer.name = result[i].customername;
                        customers.push(customer);
                    }
                }
                operation(req, res, sess, standarts, types, details, materials, analyses, customers);
            }
        );
    }



    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers){
        renderPage(req, res, sess, null, null, 1, operation, null, standarts, types, details, materials, analyses, customers);
    }

    function getEdit(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers){
        con.query("select name, type, standart, customer, alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials, analyses, customers);
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
                formData.customer = result[0].customer;
                formData.alloy = result[0].alloy;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details, materials, analyses, customers);
        });
    }

    function getDelete(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers){
        con.query("select name, type, standart, customer, alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials, analyses, customers);
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
                formData.customer = result[0].customer;
                formData.alloy = result[0].alloy;
                renderPage(req, res, sess, null, null, 1, operation, formData, standarts, types, details, materials, analyses, customers);
            });
    }

    function getView(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers){
        con.query("select name, type, standart, customer, alloy from analysisheader where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate entry") > -1) {
                        message = localization.analysisHeaderExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, standarts, types, details, materials, analyses, customers);
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
                formData.customer = result[0].customer;
                formData.alloy = result[0].alloy;
                renderPage(req, res, sess, null, null, 0, operation, formData, standarts, types, details, materials, analyses, customers);
            });
    }

    function getOperation(req, res, sess, standarts, types, details, materials, analyses, customers){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, standarts, types, id, details, materials, analyses, customers);
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

    app.get('/customeranalysis', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            var details = [];
            var materials = [];
            var analyses = [];
            var customers = [];
            getDetails(getOperation, req, res, sess, standarts, types, details, materials, analyses, customers, false);
        }else{
            res.redirect('/');
        }    
    });

    app.post('/customeranalysis', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            var details = [];
            var materials = [];
            var analyses = [];
            var customers = [];
            getDetails(postOperation, req, res, sess, standarts, types, details, materials, analyses, customers, false);
        }else{
            res.redirect('/');
            return;
        }
    });

    app.post('/customeranalysis/details', function (req, res){
        var sess = req.session;
        if(sess && sess.user){
            var standarts = [];
            var types = [];
            var details = [];
            var materials = [];
            var analyses = [];
            var customers = [];
            getDetails(postOperation, req, res, sess, standarts, types, details, materials, analyses, customers, true);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers){
        if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail, analyses, customers)){
            return;
        }
        con.query("select id from analysisheader where name like '" + name + "' and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                return
            }
            if(result.length > 0){
                var id = result[0].id;
                con.query(
                    "update analysisheader " + 
                    " set name='" + name + "'," + 
                    "customer =" + formData.customer + "," +
                    "alloy =" + formData.alloy + "," +
                    "type =" + 0 + "," +
                    "standart =" + 0 + "," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id  ,
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                            return
                        }
                        success = 1;
                        message = localization.analysisHeaderCreated;
                        actionButton = 0;
                        saveDetails(detail, id);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                        return;
                });
            }else{
                con.query("INSERT INTO analysisheader (name, type, standart, customer, alloy, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "('" + name + "', " + 0 + ", " + 0 + ", " + formData.customer + ", " + formData.alloy + ", " + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                    if (err){
                        message = err.message;
                        if(message.indexOf("Duplicate entry") > -1) {
                            message = localization.analysisHeaderExists;
                        }
                        success = 0;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts, types, details, materials, analyses, customers);
                        return;    
                    }
                    success = 1;
                    message = localization.analysisHeaderCreated;
                    actionButton = 0;
                    saveDetails(detail, result.insertId);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData,standarts,types, details, materials, analyses, customers);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                return
            }
            if(validations(req, res, sess, name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail, analyses, customers)){
                return;
            }
            con.query(
                "update analysisheader " + " set name='" + name + "'," + 
                "customer =" + formData.customer + "," +
                "alloy =" + formData.alloy + "," +
                "type =" + 0 + "," +
                "standart =" + 0 + "," +
                "edited_by=" + sess.user.id + "," +
                "edited_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderUpdated;
                    actionButton = 0;
                    saveDetails(detail, id);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from analysisheader where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                return
            }
            if(result.length == 0){
                message = localization.analysisHeaderWasNotFound;
                renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                return
            }
            con.query(
                "update analysisheader " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                        return
                    }
                    success = 1;
                    message = localization.analysisHeaderDeleted;
                    actionButton = 0;
                    saveDetails(detail, id);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, standarts, types, details, materials, analyses, customers){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //get the variables from the request
                var name = req.body.name;
                var type = req.body.type;
                var standart = req.body.standart;
                var detail = req.body.detail;
                var customer = req.body.customer;
                var alloy = req.body.alloy;
                //set form data
                var formData = [];
                formData.name = name;
                formData.type = type;
                formData.standart = standart;
                formData.detail = detail;
                formData.customer = customer;
                formData.alloy = alloy;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, standarts, types, name, type, standart, formData, message, success, actionButton, details, materials, detail, analyses, customers);
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

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers){
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
        res.render('customeranalysis', 
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
                    formDataJsonAlloy : formData != null && formData.alloy != null ? JSON.stringify(formData.alloy) : "''",
                    formDataJsonCustomer : formData != null && formData.customer != null ? JSON.stringify(formData.customer) : "''",
                    materials : materials,
                    analyses : analyses,
                    customers : customers
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess,name, message, success, operation, actionButton, formData, standarts, types, details, materials, detail, analyses, customers){
        //validations
        if(!name){
            message = addMessage(message, localization.fillForm)
        }
        if(!detail){
            message = addMessage(message, localization.mustAddDetail)
        }
        if(message){
            renderPage(req, res, sess, success, message, actionButton, operation, formData, standarts, types, details, materials, analyses, customers);
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





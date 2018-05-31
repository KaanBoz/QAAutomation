module.exports = function (app, myLocalize, functions, con, router, localization) {

    //DYNAMIC VALUES METHODS

    function getOperators(operation, req, res, sess, operators, analyses){
        con.query("select id, firstname, lastname from users where is_deleted = 0 and is_validated = 1", 
            function(err, result, fields){
                if(err){
                    operators = [];
                }else{
                    //set standarts
                    for(var i = 0; i < result.length; i++){
                        var operator = {};
                        operator.id = result[i].id;
                        operator.name = result[i].firstname + " " + result[i].lastname;
                        operators.push(operator);
                    }
                }
                getAnalyses(operation, req, res, sess, operators, analyses);
            }
        );
    }

    function getAnalyses(operation, req, res, sess, operators, analyses){
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
                operation(req, res, sess, operators, analyses);
            }
        );
    }

    //GET OPERATION METHODS

    function getAdd(req, res, sess, operation, id, operators, analyses){
        renderPage(req, res, sess, null, null, 1, operation, null, operators, analyses);
    }

    function getEdit(req, res, sess, operation, id, operators, analyses){
        con.query("select partyno, partydate, assignedto, analysis, explanation, sender, amount from qualityfollowup where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate") > -1) {
                        message = localization.followupExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, operators, analyses);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.analysis = result[0].analysis;
                formData.partyno = result[0].partyno;
                formData.partydate = getDateString(result[0].partydate);
                formData.assignedto = result[0].assignedto;
                formData.sender = result[0].sender;
                formData.explanation = result[0].explanation;
                formData.productionAmount = result[0].amount;
                renderPage(req, res, sess, null, null, 1, operation, formData, operators, analyses);
        });
    }

    function getDelete(req, res, sess, operation, id, operators, analyses){
        con.query("select partyno, partydate, assignedto, analysis, explanation, sender, amount from qualityfollowup where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate") > -1) {
                        message = localization.followupExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, operators, analyses);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.analysis = result[0].analysis;
                formData.partyno = result[0].partyno;
                formData.partydate = getDateString(result[0].partydate);
                formData.assignedto = result[0].assignedto;
                formData.sender = result[0].sender;
                formData.explanation = result[0].explanation;
                formData.productionAmount = result[0].amount;
                renderPage(req, res, sess, null, null, 1, operation, formData, operators, analyses);
            });
    }

    function getView(req, res, sess, operation, id, operators, analyses){
        con.query("select partyno, partydate, assignedto, analysis, explanation, sender, amount from qualityfollowup where is_deleted = 0 and is_validated = 1 and id=" + id, 
            function(err, result, fields){
                if(err){
                    message = err.message;
                    if(message.indexOf("Duplicate") > -1) {
                        message = localization.followupExists;
                    }
                    success = 0;
                    renderPage(req, res, sess, success, message, 0, operation, null, operators, analyses);
                    return;
                }
                if(result.length == 0){
                    res.redirect('/notfound');
                    return;
                }
                //set form data
                var formData = [];
                formData.analysis = result[0].analysis;
                formData.partyno = result[0].partyno;
                formData.partydate = getDateString(result[0].partydate);
                formData.assignedto = result[0].assignedto;
                formData.sender = result[0].sender;
                formData.explanation = result[0].explanation;
                formData.productionAmount = result[0].amount;
                renderPage(req, res, sess, null, null, 0, operation, formData, operators, analyses);
            });
    }

    function getOperation(req, res, sess, operators, analyses){
        var operation = req.query.operation;
            if(sess.user.ischef){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    getAdd(req, res, sess, operation, id, operators, analyses);
                    return;
                }else if(operation == "edit"){
                    getEdit(req, res, sess, operation, id, operators, analyses);
                    return;
                }else if (operation == "delete"){
                    getDelete(req, res, sess, operation, id, operators, analyses);
                    return;
                }else if(operation =="view"){
                    getView(req, res, sess, operation, id, operators, analyses);
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

    app.get('/qaqualityfollowupoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;    
        if(sess && sess.user){
            var operators = [];
            var analyses = [];
            getOperators(getOperation, req, res, sess, operators, analyses);
        }else{
            res.redirect('/');
        }    
    });

    app.post('/qaqualityfollowupoperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            var operators = [];
            var analyses = [];
            getOperators(postOperation, req, res, sess, operators, analyses);
        }else{
            res.redirect('/');
            return;
        }
    });


    //POST OPERATION METHODS

    function postAdd(req, res, sess, operation, formData, message, success, actionButton, operators, analyses){
        if(validations(req, res, sess, message, success, operation, actionButton, formData, operators, analyses)){
            return;
        }
        con.query("select id,partyno, partydate, assignedto, analysis, explanation from qualityfollowup where partyno=" + formData.partyno + " and analysis=" + formData.analysis + 
        " and is_deleted = 1", function(err, result, fields){
            if(err){
                message = err.message;
                formData.partydate = getDateString(formData.partydate);
                renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                return
            }
            if(result.length > 0){
                var id = result[0].id;
                con.query(
                    "update qualityfollowup " + 
                    " set partyno=" + formData.partyno + "," + 
                    "partydate =" + con.escape(formData.partydate) + "," +
                    "assignedto =" + formData.assignedto + "," +
                    "analysis =" + formData.analysis + "," +
                    "amount =" + formData.productionAmount + "," +
                    "explanation ='" + formData.explanation + "'," +
                    "sender ='" + formData.sender+ "'," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id  ,
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate") > -1) {
                                message = localization.followupExists;
                            }
                            formData.partydate = getDateString(formData.partydate);
                            renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                            return
                        }
                        success = 1;
                        message = localization.followupCreated;
                        actionButton = 0;
                        formData.partydate = getDateString(formData.partydate);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                        return;
                });
            }else{
                con.query("INSERT INTO qualityfollowup (partyno, partydate, assignedto, analysis, explanation, sender, amount, isdone, isreported, added_by, added_at, is_deleted" + 
                ", is_validated) VALUES" + 
                "(" + formData.partyno + ", " + con.escape(formData.partydate) + ", " + formData.assignedto + ", " + formData.analysis + ", '" + formData.explanation + "', '" + formData.sender + "'," + formData.productionAmount +  ",0,0, " 
                + sess.user.id + ", " 
                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                        if (err){
                        message = err.message;
                        if(message.indexOf("Duplicate") > -1) {
                            message = localization.followupExists;
                        }
                        success = 0;
                        formData.partydate = getDateString(formData.partydate);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                        return;    
                    }
                    success = 1;
                    message = localization.followupCreated;
                    actionButton = 0;
                    formData.partydate = getDateString(formData.partydate);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                    return;
                });
            }
        });
    }

    function postEdit(req, res, sess, operation, formData, message, success, actionButton, operators, analyses){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from qualityfollowup where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                formData.partydate = getDateString(formData.partydate);
                renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                return
            }
            if(result.length == 0){
                message = localization.followupWasNotFound;
                formData.partydate = getDateString(formData.partydate);
                renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                return
            }
            if(validations(req, res, sess, message, success, operation, actionButton, formData, operators, analyses)){
                return;
            }
            con.query(
                "update qualityfollowup " + 
                    " set partyno=" + formData.partyno + "," + 
                    "partydate =" + con.escape(formData.partydate) + "," +
                    "assignedto =" + formData.assignedto + "," +
                    "analysis =" + formData.analysis + "," +
                    "amount =" + formData.productionAmount + "," +
                    "explanation ='" + formData.explanation + "'," +
                    "sender ='" + formData.sender + "'," +
                    "edited_by=" + sess.user.id + "," +
                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                    "where id=" + id   ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        if(message.indexOf("Duplicate") > -1) {
                            message = localization.followupExists;
                        }
                        formData.partydate = getDateString(formData.partydate);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                        return
                    }
                    success = 1;
                    message = localization.followupUpdated;
                    actionButton = 0;
                    formData.partydate = getDateString(formData.partydate);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                    return;
            });
        });
    }

    function postDelete(req, res, sess, operation, formData, message, success, actionButton, operators, analyses){
        var id = req.query.id;
        if(!id){
            res.redirect('/notfound');
            return;
        }
        con.query("select id from qualityfollowup where id =" + id, function(err,result,fields){
            if(err){
                message = err.message;
                formData.partydate = getDateString(formData.partydate);
                renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                return
            }
            if(result.length == 0){
                message = localization.followupWasNotFound;
                formData.partydate = getDateString(formData.partydate);
                renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                return
            }
            con.query(
                "update qualityfollowup " + " set is_deleted = 1, analysis=" + id + ", deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                "where id=" + id  ,
                function(err, result, fields){
                    if(err){
                        message = err.message;
                        if(message.indexOf("Duplicate") > -1) {
                            message = localization.followupExists;
                        }
                        formData.partydate = getDateString(formData.partydate);
                        renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                        return
                    }
                    success = 1;
                    message = localization.followupDeleted;
                    actionButton = 0;
                    formData.partydate = getDateString(formData.partydate);
                    renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
                    return;
            });
        });
    }

    function postOperation(req, res, sess, operators, analyses){
        if(sess.user.ischef){
            var operation = req.query.operation;
            if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                //set form data
                var formData = [];
                formData.analysis = req.body.analysis;
                formData.partyno = req.body.partyno;
                var date = req.body.date;
                var parts =date.split('.');
                var mydate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), -1 * new Date().getTimezoneOffset()/60, 0, 0, 0); 
                formData.partydate = mydate;
                formData.assignedto = req.body.assignedto;
                formData.sender = req.body.sender;
                formData.explanation = req.body.explanation;
                formData.productionAmount = req.body.productionAmount;
                //set the message and success
                var message = "";
                var success = 0;
                var actionButton = 1;
                if(operation == "add"){
                    postAdd(req, res, sess, operation, formData, message, success, actionButton, operators, analyses);
                }else if(operation == "edit"){
                    postEdit(req, res, sess, operation, formData, message, success, actionButton, operators, analyses);
                }else if(operation == "delete"){
                    postDelete(req, res, sess, operation, formData, message, success, actionButton, operators, analyses);
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

    function renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        res.render('qaqualityfollowupoperation', 
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
                    operators : operators,
                    analyses : analyses,
                    material : (formData != null &&  formData.material != null ? formData.material : null)
                });
    }
    
    function addMessage(message, toAdd){
        return message + "<p>" + toAdd + "</p>";
    }
    
    function validations(req, res, sess, message, success, operation, actionButton, formData, operators, analyses){
        //validations
        if(!formData.analysis || !formData.partyno || !formData.partydate || !formData.assignedto || !formData.productionAmount){
            message = addMessage(message, localization.fillFormRequired)
        }
        if(message){
            formData.partydate = getDateString(formData.partydate);
            renderPage(req, res, sess, success, message, actionButton, operation, formData, operators, analyses);
            return true;
        }
        return false;
    }

    function getDateString(date){
        var zeroStringMonth = "0";
        var zeroStringDate = "0";
        if(date.getMonth()+1 > 9){
            zeroStringMonth = "";
        }
        if(date.getDate() > 9){
            zeroStringDate = "";
        }
        var datestring = zeroStringDate + date.getDate()  + "." + zeroStringMonth + (date.getMonth()+1) + "." + date.getFullYear();
        return datestring;
    }

    return module;
}





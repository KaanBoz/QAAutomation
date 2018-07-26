module.exports = function (app, myLocalize, functions, con, router, localization) {
    
    app.get('/qauseroperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            var operation = req.query.operation;
            if(sess.user.isadmin){
                var id = req.query.id;
                if(!id && (operation == "edit" || operation == "delete" || operation == "view")){
                    res.redirect('/notfound');
                    return;
                }
                if(operation == "add"){
                    renderQauseroperation(req, res, sess, null, null, 1, operation, null);
                    return;
                }else if(operation == "edit"){
                    con.query("select mail, firstname, lastname, password, isadmin, ischef, isoperator from users where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.userExists;
                            }
                            success = 0;
                            renderQauseroperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.email = result[0].mail;
                        formData.name = result[0].firstname;
                        formData.surname = result[0].lastname;
                        formData.password = functions.decrypt(result[0].password);
                        formData.passwordAgain = functions.decrypt(result[0].password);
                        formData.isAdmin = result[0].isadmin;
                        formData.isChef = result[0].ischef;
                        formData.isOperator = result[0].isoperator;
                        renderQauseroperation(req, res, sess, null, null, 1, operation, formData);
                    });
                    return;
                }else if (operation == "delete"){
                    con.query("select mail, firstname, lastname, password, isadmin, ischef, isoperator from users where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.userExists;
                            }
                            success = 0;
                            renderQauseroperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.email = result[0].mail;
                        formData.name = result[0].firstname;
                        formData.surname = result[0].lastname;
                        formData.password = functions.decrypt(result[0].password);
                        formData.passwordAgain = functions.decrypt(result[0].password);
                        formData.isAdmin = result[0].isadmin;
                        formData.isChef = result[0].ischef;
                        formData.isOperator = result[0].isoperator;
                        renderQauseroperation(req, res, sess, null, null, 1, operation, formData);
                    });
                    return;
                }else if(operation =="view"){
                    con.query("select mail, firstname, lastname, password, isadmin, ischef, isoperator from users where is_deleted = 0 and is_validated = 1 and id=" + id, 
                    function(err, result, fields){
                        if(err){
                            message = err.message;
                            if(message.indexOf("Duplicate entry") > -1) {
                                message = localization.userExists;
                            }
                            success = 0;
                            renderQauseroperation(req, res, sess, success, message, 0, operation, null);
                            return;
                        }
                        if(result.length == 0){
                            res.redirect('/notfound');
                            return;
                        }
                        //set form data
                        var formData = [];
                        formData.email = result[0].mail;
                        formData.name = result[0].firstname;
                        formData.surname = result[0].lastname;
                        formData.password = functions.decrypt(result[0].password);
                        formData.passwordAgain = functions.decrypt(result[0].password);
                        formData.isAdmin = result[0].isadmin;
                        formData.isChef = result[0].ischef;
                        formData.isOperator = result[0].isoperator;
                        renderQauseroperation(req, res, sess, null, null, 0, operation, formData);
                    });
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
        }else{
            res.redirect('/');
            return;
        }
    });

    app.post('/qauseroperation', function (req, res){
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess.user.isadmin){
                var operation = req.query.operation;
                if(operation == 'add' || operation == 'edit' || operation == 'delete'){
                    //get the variables from the request
                    var email = req.body.email;
                    var name = req.body.name;
                    var surname = req.body.surname;
                    var password = req.body.password;
                    var passwordAgain = req.body.passwordAgain;
                    var isAdmin = req.body.isAdmin;
                    if(isAdmin){
                        isAdmin = 1;
                    }else {
                        isAdmin = 0;
                    }
                    var isChef = req.body.isChef;
                    if(isChef){
                        isChef = 1;
                    }else {
                        isChef = 0;
                    }
                    var isOperator = req.body.isOperator;
                    if(isOperator){
                        isOperator = 1;
                    }else {
                        isOperator = 0;
                    }
                    //set form data
                    var formData = [];
                    formData.email = email;
                    formData.name = name;
                    formData.surname = surname;
                    formData.password = password;
                    formData.passwordAgain = passwordAgain;
                    formData.isAdmin = isAdmin;
                    formData.isChef = isChef;
                    formData.isOperator = isOperator;
                    //set the message and success
                    var message = "";
                    var success = 0;
                    var actionButton = 1;
                    if(operation == "add"){
                        if(validations(req, res, sess, email, name, surname, password, passwordAgain, message, success, operation, actionButton, formData)){
                            return;
                        }
                        con.query("select id from users where mail='" + email + "' and is_deleted = 1", function(err, result, fields){
                            if(err){
                                message = err.message;
                                renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length > 0){
                                var id = result[0].id;
                                con.query(
                                    "update users " + " set firstname='" + name + "'," + 
                                    "lastname='" + surname + "', mail='" + email + "', password='" + functions.encrypt(password) + "', " +
                                    "isadmin=" + isAdmin + ", ischef=" + isChef + ", isoperator=" + isOperator + ", edited_by=" + sess.user.id + "," +
                                    "edited_at=" + con.escape(new Date()) + ", is_deleted = 0, deleted_by = null, deleted_at = null " +
                                    "where id=" + id  ,
                                    function(err, result, fields){
                                        if(err){
                                            message = err.message;
                                            renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                            return
                                        }
                                        success = 1;
                                        message = localization.userCreated;
                                        actionButton = 0;
                                        renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return;
                                });
                            }else{
                                con.query("INSERT INTO users (firstname, lastname, mail, password, isadmin, ischef, isoperator, added_by, added_at, is_deleted" + 
                                ", is_validated) VALUES" + 
                                "('" + name + "', '"+ surname + "', '" + email + "', '" +functions.encrypt(password) + "', "+ isAdmin + 
                                ", " + isChef + ", " + isOperator + ", " + sess.user.id + ", " 
                                + con.escape(new Date()) + ", 0, 1)", function(err, result, fields){
                                    if (err){
                                        message = err.message;
                                        if(message.indexOf("Duplicate entry") > -1) {
                                            message = localization.userExists;
                                        }
                                        success = 0;
                                        renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return;    
                                    }
                                    success = 1;
                                    message = localization.userCreated;
                                    actionButton = 0;
                                    renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
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
                        con.query("select id from users where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length == 0){
                                message = localization.userWasNotFound;
                                renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(validations(req, res, sess, email, name, surname, password, passwordAgain, message, success, operation, actionButton, formData)){
                                return;
                            }
                            con.query(
                                "update users " + " set firstname='" + name + "'," + 
                                "lastname='" + surname + "', mail='" + email + "', password='" + functions.encrypt(password) + "', " +
                                "isadmin=" + isAdmin + ", ischef=" + isChef + ", isoperator=" + isOperator + ", edited_by=" + sess.user.id + "," +
                                "edited_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return
                                    }
                                    success = 1;
                                    message = localization.userUpdated;
                                    actionButton = 0;
                                    renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                    return;
                            });
                        });
                    }else if(operation == "delete"){
                        var id = req.query.id;
                        if(!id){
                            res.redirect('/notfound');
                            return;
                        }
                        con.query("select id from users where id =" + id, function(err,result,fields){
                            if(err){
                                message = err.message;
                                renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            if(result.length == 0){
                                message = localization.userWasNotFound;
                                renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                return
                            }
                            con.query(
                                "update users " + " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
                                "where id=" + id  ,
                                function(err, result, fields){
                                    if(err){
                                        message = err.message;
                                        renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
                                        return
                                    }
                                    success = 1;
                                    message = localization.userDeleted;
                                    actionButton = 0;
                                    renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
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

    function renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData){
        var a = ((operation == "add" || operation == "edit") && success == 1) || operation == "delete" ? 1 : 0;
        res.render('qauseroperation', 
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

    function validations(req, res, sess, email, name, surname, password, passwordAgain, message, success, operation, actionButton, formData){
        //validations
        if(!email || !name || !surname || !password || !passwordAgain){
            message = addMessage(message, localization.fillForm)
        }
        if(!functions.validateEmail(email)){
            message = addMessage(message, localization.enterValidEmail);
        }
        if (password !=  passwordAgain){
            message = addMessage(message, localization.passwordsDoesNotMatch);
        }
        if(message){
            renderQauseroperation(req, res, sess, success, message, actionButton, operation, formData);
            return true;
        }
        return false;
    }

    return module;
}
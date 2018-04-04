module.exports = function (app, myLocalize, functions, con, router, localization) {

    /*GET*/
    app.get('/login', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            res.redirect('/welcome');
        }else{
            renderLogin(req, res, null);
        }
    });

    /*POST*/
    app.post('/login', function (req, res) {
        functions.setLocale(req, res, req.body.lang);
        localization.refresh();
        var message = "";
        var user = null;
        var mail = req.body.mail;
        var password = req.body.password;
        var sess = req.session;
        if(sess && sess.user){
            res.redirect('/welcome');
            return;
        }
        if(req.body.isLangChange == "1"){
            renderLogin(req, res, null, mail, password);
            return;
        }else{
            if(!functions.validateEmail(mail)){
                message = localization.enterValidEmail;
                renderLogin(req, res, message, mail, password);
                return;
            }
            var encryptPassword = functions.encrypt(password);
            con.query("select * from users where mail = '" + mail + "' and is_deleted = 0 and is_validated = 1", function (err, result, fields) {
                if (err) throw err;
                if(result.length > 0){
                    user = result[0];
                }
                if(user){
                    if(user.password == encryptPassword){
                        sess.user = user;
                        res.redirect('/welcome');
                        return;
                    }else{
                        message = localization.wrongPassword;
                        renderLogin(req, res, message, mail, password);
                        return;
                    }
                }else{
                    message = localization.userDoesNotExists;
                    renderLogin(req, res, message, mail, password);
                    return;
                }
            });      
        }
    });

    /*RETURN FOR POST METHOD*/
    function renderLogin(req, res, message, mail, password){
        res.render('login', 
                    { 
                        message: message,
                        data: req.body,
                        localization : localization,
                        mail: mail,
                        password : password
                    }); 
    }

    return module;
}
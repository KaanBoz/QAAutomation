module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/welcome', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            res.render('welcome', 
            { 
                data: req.body,
                userName : functions.capitalizeFirstLetter(sess.user.firstname),
                userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                isAdmin : sess.user.isadmin,
                isChef : sess.user.ischef,
                isOperator : sess.user.isoperator,
                localization : localization
            });
        }else{
            res.redirect('/');
        }
    });
    return module;
}
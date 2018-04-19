module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaanalysisstandart', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            res.render('qaanalysisstandart', 
            { 
                data: req.body,
                userName : functions.capitalizeFirstLetter(sess.user.firstname),
                userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                isAdmin : sess.user.isadmin,
                isChef : sess.user.ischef,
                isOperator : sess.user.isoperator,
                localization : localization,
                localizationVal : req.body.lang
            });
        }else{
            res.redirect('/');
        }
    });
    return module;
}
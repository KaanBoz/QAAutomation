module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/customerproducts', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                res.render('customerproducts', 
                { 
                    data: req.body,
                    localization : localization,
                    userName : functions.capitalizeFirstLetter(sess.user.firstname),
                    userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                    isAdmin : sess.user.isadmin,
                    isChef : sess.user.ischef,
                    isOperator : sess.user.isoperator,
                    localizationVal : req.body.lang
                });
            }else{
                res.redirect('/customerproducts');
            }          
        }else{
            res.redirect('/');
        }
    });
    return module;
}
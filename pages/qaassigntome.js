module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaassigntome', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                var id = req.query.id;
                con.query("update qualityfollowup set assignedto =" + sess.user.id + " where id=" + id, function(err,result,fields){
                    res.render('qaassignedtome', 
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
                });
                
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });
    return module;
}
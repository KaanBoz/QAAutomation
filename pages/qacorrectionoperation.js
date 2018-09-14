module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qacorrectionoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess && sess.user.ischef){
                var id = req.query.id;
                con.query("select id, analysisname, archived from correctionheader where id=" + id, function(err, result, fields){
                    var formData = result[0];
                    con.query("select id, name, addedamount from correctiondetails where headerid=" + id, function(err, result, fields){
                        formData.details = result;
                        res.render('qacorrectionoperation', 
                        { 
                            data: req.body,
                            userName : functions.capitalizeFirstLetter(sess.user.firstname),
                            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                            isAdmin : sess.user.isadmin,
                            isChef : sess.user.ischef,
                            isOperator : sess.user.isoperator,
                            localization : localization,
                            localizationVal : req.body.lang,
                            formData : formData
                        });
                    });
                });
            }else{
                res.redirect('/permissiondenied');
            }   
        }else{
            res.redirect('/');
        }
    });

    app.post('/qacorrectionoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if(sess && sess.user){
            if(sess && sess.user.ischef){
                var id = req.query.id;
                con.query("update correctionheader set archived = 1 where id=" + id, function(err, result, fields){
                    res.redirect('/qaallcorrections');
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
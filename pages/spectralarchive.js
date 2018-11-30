module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/spectralarchive', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            renderPage(req,res,sess);
        } else {
            res.redirect('/');
        }
    });

    function renderPage(req, res, sess) {
        res.render('spectralarchive',
            {
                localization: localization,
                userName: functions.capitalizeFirstLetter(sess.user.firstname),
                userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                isAdmin: sess.user.isadmin,
                isChef: sess.user.ischef,
                isOperator: sess.user.isoperator,
                localizationVal: req.body.lang,
                localizationJson: JSON.stringify(localization),
            });
    }

    return module;
}
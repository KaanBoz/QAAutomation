module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/permissiondenied', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        res.render('permissiondenied', 
        { 
            localization : localization,
        }); 
    });
    
    return module;
}
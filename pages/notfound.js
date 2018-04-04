module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('*', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        res.render('notfound', 
        { 
            localization : localization,
        }); 
    });

    app.post('*', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        res.render('notfound', 
        { 
            localization : localization,
        }); 
    });
    
    return module;
}
module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/logout', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        req.session.destroy(function(err) {});
        res.end();
    });
    return module;
}
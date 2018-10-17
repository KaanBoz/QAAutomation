module.exports = function (app, myLocalize, functions, con, router, localization) {

    app.get('/product', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.ischef) {
                var operation = req.query.operation;
                if (operation == "add") {
                    renderPage(req, res, operation, getEmptyModel(), "false");
                } else if (operation == "view") {
                    renderPageWithQuery(req, res, operation, "true");
                } else if (operation == "edit") {
                    renderPageWithQuery(req, res, operation, "false");
                } else if (operation == "delete") {
                    renderPageWithQuery(req, res, operation, "true");
                }
            } else {
                res.redirect('/permissiondenied');
            }
        } else {
            res.redirect('/');
        }
    });

    app.post('/product', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;
        if (sess && sess.user) {
            if (sess.user.ischef) {
                var operation = req.query.operation;
                if (operation == "add") {
                    opAdd(req, res, req.body);
                } else if (operation == "edit") {
                    opUpdate(req, res, req.body);
                } else if (operation == "delete") {
                    opDelete(req, res, req.body);
                }
            } else {
                res.redirect('/permissiondenied');
            }
        } else {
            res.redirect('/');
        }
    });

    function opAdd(req, res, model) {
        con.query("INSERT INTO product (alloyNoCode, alloyNoEx, productionTypeCode, productionTypeEx, productDetail1Code, productDetail1Ex, productDetail2Code, productDetail2Ex" +
            ", added_by, added_at, is_deleted, is_validated) VALUES" +
            "('" + model.alloyNoCode + "'," +
            "'" + model.alloyNoEx + "'," +
            "'" + model.productionTypeCode + "'," +
            "'" + model.productionTypeEx + "'," +
            "'" + model.productDetail1Code + "'," +
            "'" + model.productDetail1Ex + "'," +
            "'" + model.productDetail2Code + "'," +
            "'" + model.productDetail2Ex + "'," +
            + sess.user.id + ", " + con.escape(new Date()) + ", 0, 1)",
            function (err, result, fields) {
                if (err) {
                    model.err = 1;
                    model.errMessage = err.message;
                } else {
                    model.err = 0;
                }
                res.send(JSON.stringify(model));
            });
    }

    function opUpdate(req, res, model) {
        con.query("UPDATE product " +
            "SET " +
            "alloyNoCode = '" + model.alloyNoCode + "'," +
            "alloyNoEx = '" + model.alloyNoEx + "'," +
            "productionTypeCode = '" + model.productionTypeCode + "'," +
            "productionTypeEx = '" + model.productionTypeEx + "'," +
            "productDetail1Code = '" + model.productDetail1Code + "'," +
            "productDetail1Ex = '" + model.productDetail1Ex + "'," +
            "productDetail2Code = '" + model.productDetail2Code + "'," +
            "productDetail2Ex = '" + model.productDetail2Ex + "'" +
            "where id = " + req.query.id,
            function (err, result, fields) {
                if (err) {
                    model.err = 1;
                    model.errMessage = err.message;
                } else {
                    model.err = 0;
                }
                res.send(JSON.stringify(model));
            });
    }
    function opDelete(req, res, model) {
        con.query(
            "update product " +
            " set is_deleted = 1, deleted_by=" + sess.user.id + ", deleted_at=" + con.escape(new Date()) + " " +
            "where id=" + req.query.id,
            function (err, result, fields) {
                if (err) {
                    model.err = 1;
                    model.errMessage = err.message;
                } else {
                    model.err = 0;
                }
                res.send(JSON.stringify(model));
            });
    }

    function getEmptyModel() {
        var model = {};
        model.alloyNoCode = "";
        model.alloyNoEx = "";
        model.productionTypeCode = "";
        model.productionTypeEx = "";
        model.productDetail1Code = "";
        model.productDetail1Ex = "";
        model.productDetail2Code = "";
        model.productDetail2Ex = "";
        return model;
    }

    function renderPage(req, res, operation, model, disabled) {
        res.render('product',
            {
                data: req.body,
                localization: localization,
                userName: functions.capitalizeFirstLetter(sess.user.firstname),
                userSurname: functions.capitalizeFirstLetter(sess.user.lastname),
                isAdmin: sess.user.isadmin,
                isChef: sess.user.ischef,
                isOperator: sess.user.isoperator,
                localizationVal: req.body.lang,
                operation: operation,
                model: JSON.stringify(model),
                localizationJson: JSON.stringify(localization),
                disabled: disabled
            });
    }

    function renderPageWithQuery(req, res, operation, disabled) {
        con.query("select alloyNoCode, alloyNoEx, productionTypeCode, productionTypeEx, productDetail1Code, productDetail1Ex," +
            " productDetail2Code, productDetail2Ex from product where id =" + req.query.id,
            function (err, result, fields) {
                renderPage(req, res, operation, JSON.stringify(result[0]), disabled);
            });
    }

    return module;
}
module.exports = function (app, myLocalize, functions, con, router, localization) {

    app.get('/customer', function (req, res) {
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

    app.post('/customer', function (req, res) {
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
        con.query("INSERT INTO customer (customername, responsibleperson, telephone, email" +
            ", added_by, added_at, is_deleted, is_validated) VALUES" +
            "('" + model.customerName + "'," +
            "'" + model.responsiblePerson + "'," +
            "'" + model.telephone + "'," +
            "'" + model.email + "'," +
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
        con.query("UPDATE customer " +
            "SET " +
            "customername = '" + model.customerName + "'," +
            "responsibleperson = '" + model.responsiblePerson + "'," +
            "telephone = '" + model.telephone + "'," +
            "email = '" + model.email + "'" +
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
            "update customer " +
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
        model.customerName = "";
        model.responsiblePerson = "";
        model.telephone = "";
        model.email = "";
        return model;
    }

    function renderPage(req, res, operation, model, disabled) {
        res.render('customer',
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
        con.query("select customername as customerName, responsibleperson as responsiblePerson, telephone, email" +
            " from customer where id =" + req.query.id,
            function (err, result, fields) {
                renderPage(req, res, operation, JSON.stringify(result[0]), disabled);
            });
    }

    return module;
}
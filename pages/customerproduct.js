module.exports = function (app, myLocalize, functions, con, router, localization) {

    app.get('/customerproduct', function (req, res) {
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

    app.post('/customerproduct', function (req, res) {
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
        con.query("INSERT INTO customerproduct (customer, product" +
            ", added_by, added_at, is_deleted, is_validated) VALUES" +
            "(" + model.customer.id + "," +
            "" + model.product.id + ","
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
        con.query("UPDATE customerproduct " +
            "SET " +
            "customer = " + model.customer.id + "," +
            "product = " + model.product.id + " " +
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
            "update customerproduct " +
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
        model.customer = { id : 0, customername : localization.choose};
        model.product = { id : 0, name : localization.choose};
        return model;
    }

    async function renderPage(req, res, operation, model, disabled) {
        await getProducts.then((data) => {
            model.products = data;
        }).catch((error) => {
            console.log(error);
            model.products = null;
        });
        for(let i = 0 ; i < model.products.length; i++){
            let product = model.products[i];
            product.name = product.alloyNoCode + '-' + product.productionTypeCode + '-' + product.productDetail1Code + '-' + product.productDetail2Code;
        }
        await getCustomers.then((data) => {
            model.customers = data;
        }).catch((error) => {
            console.log(error);
            model.customers = null;
        });
        res.render('customerproduct',
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
        con.query("select id, customer , product" +
            " from customerproduct where id =" + req.query.id,
            function (err, result, fields) {
                let i = 1;
                var model = {};
                model.customer = result[0].customer;
                model.product = result[0].product;
                renderPage(req, res, operation, model, disabled);
            });
    }

    var getProducts = new Promise((resolve, reject) => {
        con.query("select id, alloyNoCode, productionTypeCode, productDetail1Code, productDetail2Code from product",
            (err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
    });

    var getCustomers = new Promise((resolve, reject) => {
        con.query("select id, customername from customer",
            (err, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
    });

    return module;
}
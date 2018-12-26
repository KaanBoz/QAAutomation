module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/customerproductstable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "customername";
        if(orderColumn == 2){
            orderColumnTxt = "productname"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = " where (" + 
            " (CONCAT(product.alloyNoCode, '-', product.productionTypeCode, '-', product.productDetail1Code, '-', product.productDetail2Code)  like '%" + search + "%' or " + 
            " customer.customername like '%" + search + "%' ) and " + 
            " customerproduct.is_deleted = 0 and " + 
            " customerproduct.is_validated = 1";
        var sql = 
            "(select " + 
            " customerproduct.id as id, " +
            " customer.customername as customername, " + 
            " CONCAT(product.alloyNoCode, '-', product.productionTypeCode, '-', product.productDetail1Code, '-', product.productDetail2Code) as productname" + 
            " from customerproduct" +
            " INNER JOIN customer ON customer.id=customerproduct.customer " +
            " INNER JOIN product ON product.id=customerproduct.product "+ whereCondition + ")) as t ";
        if(sess && sess.user){
            con.query("SELECT COUNT(id) AS count FROM customerproduct where is_deleted = 0 and is_validated = 1" , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].count;
                con.query("SELECT COUNT(id) AS count FROM  " + sql , function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].count;
                    con.query("select id, customername, productname from " + sql + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../customerproduct?operation=view&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../customerproduct?operation=edit&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../customerproduct?operation=delete&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : usersDb[i].customername, 1 : usersDb[i].productname, 2 : buttonView });
                        }
                        res.send({
                            draw : req.query.draw,
                            recordsTotal : recordsTotal,
                            recordsFiltered : recordsFiltered,
                            data : data
                        })
                    });
                });
            });
        }
    });
    return module;
}
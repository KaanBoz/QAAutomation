module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/customertable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "customername";
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = "where customername  like '%" + search + "%'" + 
        " and is_deleted = 0 and is_validated = 1 " ;
        if(sess && sess.user){
            con.query("SELECT COUNT(customername) AS customer FROM customer where is_deleted = 0 and is_validated = 1 " , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].product;
                con.query("SELECT COUNT(customername) AS customer FROM customer " + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].product;
                    con.query("select id, customername from customer " + whereCondition + " order by " 
                    + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var db = result;
                        var data = [];
                        for (i = 0; i < db.length; i++) { 
                            var buttonView = 
                            "<a href=\"../customer?operation=view&id=" + db[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../customer?operation=edit&id=" + db[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../customer?operation=delete&id=" + db[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : db[i].customername, 1 : buttonView });
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
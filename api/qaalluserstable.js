module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaalluserstable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "firstname";
        if(orderColumn == 2){
            orderColumnTxt = "lastname"
        }else if(orderColumn == 3){
            orderColumnTxt = "mail"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = "where (firstname like '%" + search + "%' or lastname like '%" + search + "%' or mail like '%" + search + "%')" + 
        " and is_deleted = 0 and is_validated = 1 and id <> " + sess.user.id;
        if(sess && sess.user){
            con.query("SELECT COUNT(firstname) AS users FROM users where is_deleted = 0 and is_validated = 1 and id <> " + sess.user.id , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].users;
                con.query("SELECT COUNT(firstname) AS users FROM users " + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].users;
                    con.query("select id, firstname, lastname, mail from users " + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qauseroperation?operation=view&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-user\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qauseroperation?operation=edit&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qauseroperation?operation=delete&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : usersDb[i].firstname, 1 : usersDb[i].lastname, 2 : usersDb[i].mail , 
                                3 : buttonView
                            });
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
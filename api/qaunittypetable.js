module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaunittypetable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "name";
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = "where (name like '%" + search + "%' and short like '%" + search + "%')" + 
        " and is_deleted = 0 and is_validated = 1";
        if(sess && sess.user){
            con.query("SELECT COUNT(name) AS name FROM unittype where is_deleted = 0 and is_validated = 1 ", 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].name;
                con.query("SELECT COUNT(name) AS name FROM unittype " + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].name;
                    con.query("select id, name, short from unittype " + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaunittypeoperation?operation=view&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-user\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaunittypeoperation?operation=edit&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaunittypeoperation?operation=delete&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({
                                0 : usersDb[i].name, 
                                1 : usersDb[i].short, 
                                2 : buttonView
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

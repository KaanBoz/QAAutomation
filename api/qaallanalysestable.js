module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaallanalysestable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "analysisname";
        if(orderColumn == 2){
            orderColumnTxt = "typename"
        }else if(orderColumn == 3){
            orderColumnTxt = "standartname"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = " where (analysisheader.name  like '%" + search + 
        "%' or analysistype.name like '%" + search + "%' or analysisstandart.name like '%" + search + "%')" + 
        " and analysisheader.is_deleted = 0 and analysisheader.is_validated = 1";
        var sql = "(select analysisheader.id as analysisid, analysisheader.name as analysisname, analysisstandart.name as standartname" + 
            ", analysistype.name as typename from analysisheader" +
            " INNER JOIN analysisstandart ON analysisstandart.id=analysisheader.standart" +
            " INNER JOIN analysistype ON analysistype.id=analysisheader.type" + whereCondition + ") as t ";
        if(sess && sess.user){
            con.query("SELECT COUNT(name) AS count FROM analysisheader where is_deleted = 0 and is_validated = 1" , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].count;
                con.query("SELECT COUNT(analysisname) AS count FROM  " + sql , function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].count;
                    con.query("select analysisid, analysisname, standartname, typename from " + sql + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaanalysesoperation?operation=view&id=" + usersDb[i].analysisid + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-user\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaanalysesoperation?operation=edit&id=" + usersDb[i].analysisid + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaanalysesoperation?operation=delete&id=" + usersDb[i].analysisid + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : usersDb[i].analysisname, 1 : usersDb[i].typename, 2 : usersDb[i].standartname , 3 : buttonView });
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
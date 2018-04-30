module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaallanalysisdetailtable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "materialname";
        if(orderColumn == 2){
            orderColumnTxt = "min"
        }else if(orderColumn == 3){
            orderColumnTxt = "max"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = " where (" + 
            " CONCAT(material.name, ' (', unittype.name, '-', unittype.short, ')')  like '%" + search + "%' or " + 
            " min like '%" + search + "%' or " + 
            " max like '%" + search + "%') and " + 
            " analysisdetail.is_deleted = 0 and " + 
            " analysisdetail.is_validated = 1";
        var sql = 
            "(select " + 
            " analysisdetail.id as id, " +
            " CONCAT(material.name, ' (', unittype.name, '-', unittype.short, ')') as materialname, " + 
            " analysisdetail.min as min, " + 
            " analysisdetail.max as max" + 
            " from analysisdetail" +
            " INNER JOIN material ON material.id=analysisdetail.material " +
            " INNER JOIN unittype ON unittype.id=material.unit "+ whereCondition + ") as t ";
        if(sess && sess.user){
            con.query("SELECT COUNT(name) AS count FROM analysisheader where is_deleted = 0 and is_validated = 1" , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].count;
                con.query("SELECT COUNT(materialname) AS count FROM  " + sql , function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].count;
                    con.query("select id,materialname, min, max from " + sql + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaanalysisdetailoperation?operation=view&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaanalysisdetailoperation?operation=edit&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaanalysisdetailoperation?operation=delete&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : usersDb[i].materialname, 1 : usersDb[i].min, 2 : usersDb[i].max , 3 : buttonView });
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
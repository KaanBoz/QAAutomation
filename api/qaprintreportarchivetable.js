module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaprintreportarchivetable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "report";
        if(orderColumn == 2){
            orderColumnTxt = "company"
        }else if(orderColumn == 3){
            orderColumnTxt = "reportdata"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var t  = "(select id, followupid, reportdata, company, report, is_deleted, is_validated, archived, added_by from reportheader) as t ";
        var whereCondition = "where (reportdata like '%" + search + "%' or company like '%" + search + "%' or report like '%" + search + "%')" + 
        " and is_deleted = 0 and is_validated = 1 and archived = 1";
        if(sess && sess.user){
            con.query("SELECT COUNT(id) AS assignedtome FROM " + t + " where is_deleted = 0 and is_validated = 1 and archived = 0 and added_by =" + sess.user.id , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].assignedtome;
                con.query("SELECT COUNT(id) AS assignedtome FROM " + t + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].assignedtome;
                    con.query("select id, followupid, reportdata, company, report from " + t + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qareport?id=" + usersDb[i].id + "&lang=tr\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "TR" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qareport?id=" + usersDb[i].id + "&lang=en\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "EN" +
                                    "</span>" +
                                "</button>" +
                            "</a>";
                            data.push({0 : usersDb[i].report, 1 : usersDb[i].company, 2 : usersDb[i].reportdata , 
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

    function getFormattedDate(date) {
        var year = date.getFullYear();
      
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
      
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        return day + '/' + month + '/' + year;
      }

    return module;
}
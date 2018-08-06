module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaeditmasteralloytable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "added_at";
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var followupId  = req.query.followupId;
        var t  = "(select id, added_at, is_deleted, is_validated, followup from masteralloyresult) as t ";
        var whereCondition = "where (added_at like '%" + search + "%') and " + 
        " is_deleted = 0 and is_validated = 1 and followup = " + followupId;
        if(sess && sess.user){
            con.query("SELECT COUNT(id) AS masteralloyresult FROM " + t + " where  is_deleted = 0 and is_validated = 1 and followup = " + followupId , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].masteralloyresult;
                con.query("SELECT COUNT(id) AS masteralloyresult FROM " + t + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].masteralloyresult;
                    con.query("select id, added_at from " + t + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaeditmasteralloyresult?id=" + followupId + "&operation=" + "view&resultId=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaeditmasteralloyresult?id=" + followupId + "&operation=" + "edit&resultId=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaeditmasteralloyresult?id=" + followupId + "&operation=" + "delete&resultId=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : usersDb[i].added_at.getDate() + "/" +  
                            (usersDb[i].added_at.getMonth() + 1) + "/" +
                            usersDb[i].added_at.getFullYear() + "" +
                            " " +usersDb[i].added_at.toLocaleTimeString(),
                                1 : buttonView
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
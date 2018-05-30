module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaassignedtometable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "name";
        if(orderColumn == 2){
            orderColumnTxt = "partydate"
        }else if(orderColumn == 3){
            orderColumnTxt = "partyno"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var t  = "(select qualityfollowup.id, qualityfollowup.isdone, analysisheader.name, qualityfollowup.partydate, qualityfollowup.partyno, qualityfollowup.is_deleted, qualityfollowup.is_validated, qualityfollowup.assignedto from qualityfollowup inner join analysisheader on qualityfollowup.analysis = analysisheader.id) as t ";
        var whereCondition = "where (name like '%" + search + "%' or partydate like '%" + search + "%' or partyno like '%" + search + "%')" + 
        " and isdone = 0 and is_deleted = 0 and is_validated = 1 and assignedto = " + sess.user.id;
        if(sess && sess.user){
            con.query("SELECT COUNT(name) AS assignedtome FROM " + t + " where isdone = 0 and is_deleted = 0 and is_validated = 1 and assignedto = " + sess.user.id , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].assignedtome;
                con.query("SELECT COUNT(name) AS assignedtome FROM " + t + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].assignedtome;
                    con.query("select id, name, partydate, partyno from " + t + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaeditassigned?id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>";
                            data.push({0 : usersDb[i].name, 1 : getFormattedDate(usersDb[i].partydate), 2 : usersDb[i].partyno , 
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
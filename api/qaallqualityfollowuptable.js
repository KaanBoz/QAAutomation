module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaallqualityfollowuptable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "partyno";
        if(orderColumn == 2){
            orderColumnTxt = "partydate"
        }else if(orderColumn == 3){
            orderColumnTxt = "analysisname"
        }else if(orderColumn == 4){
            orderColumnTxt = "name"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = " where (" + 
            " CONCAT(users.firstname, ' ', users.lastname)  like '%" + search + "%' or " + 
            " qualityfollowup.partydate like '%" + search + "%' or " + 
            " analysisheader.name like '%" + search + "%') and " + 
            " qualityfollowup.isdone = 0 and " + 
            " qualityfollowup.is_deleted = 0 and " + 
            " qualityfollowup.added_by = " + sess.user.id  +  " and " + 
            " qualityfollowup.is_validated = 1";
        var sql = 
            "(select " +
                "qualityfollowup.id as id, " +
                "qualityfollowup.added_by as added_by, " +
                "qualityfollowup.partyno as partyno, " +
                "qualityfollowup.partydate as partydate, " +
                "analysisheader.name as analysisname, " +
                "CONCAT(users.firstname, ' ', users.lastname) as name " +
            "from qualityfollowup " +
            "inner join analysisheader on analysisheader.id= qualityfollowup.analysis " +
            "inner join users on users.id=qualityfollowup.assignedto " + whereCondition + ") as t " ;
        if(sess && sess.user){
            con.query("SELECT COUNT(partyno) AS count FROM qualityfollowup where is_deleted = 0 and is_validated = 1 and isdone=0 and added_by = " + sess.user.id , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].count;
                con.query("SELECT COUNT(partyno) AS count FROM  " + sql , function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].count;
                    con.query("select id,partyno, partydate, analysisname, name from " + sql + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var usersDb = result;
                        var data = [];
                        for (i = 0; i < usersDb.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qaqualityfollowupoperation?operation=view&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaqualityfollowupoperation?operation=edit&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qaqualityfollowupoperation?operation=delete&id=" + usersDb[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            var zeroStringMonth = "0";
                            var zeroStringDate = "0";
                            if(usersDb[i].partydate.getMonth()+1 > 9){
                                zeroStringMonth = "";
                            }
                            if(usersDb[i].partydate.getDate() > 9){
                                zeroStringDate = "";
                            }
                            var datestring = zeroStringDate + usersDb[i].partydate.getDate()  + "." + zeroStringMonth + (usersDb[i].partydate.getMonth()+1) + "." + usersDb[i].partydate.getFullYear();

                            data.push({0 : usersDb[i].partyno, 1 : datestring, 2 : usersDb[i].analysisname , 3 : usersDb[i].name, 4 : buttonView });
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
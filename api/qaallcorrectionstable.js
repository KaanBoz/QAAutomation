module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaallcorrectionstable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "analysisname";
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = "where (analysisname like '%" + search + "%' )" + 
        " and is_deleted = 0 and is_validated = 1 and archived = 0 and owner =" + sess.user.id;
        if(sess && sess.user){
            con.query("SELECT COUNT(analysisname) as count FROM correctionheader where is_deleted = 0 and is_validated = 1 " , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].count;
                con.query("select COUNT(analysisname) as count from correctionheader " + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].count;
                    con.query("select id, analysisname from correctionheader " 
                    + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var db = result;
                        var data = [];
                        for (i = 0; i < db.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qacorrectionoperation?id=" + db[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>";
                            data.push({0 : db[i].analysisname, 1 : buttonView});
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
module.exports = function (app, myLocalize, functions, con, router) {
    app.get('/qaallmaterialstable', function (req, res) {
        functions.setLocale(req, res, null);
        sess = req.session;        
        var orderColumn = req.query.order[0].column;
        var orderColumnTxt = "name";
        if(orderColumn == 2){
            orderColumnTxt = "unitname"
        }
        var orderDir = req.query.order[0].dir;
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var search = req.query.search.value;
        var limit = start + ", " + (length - 1);
        var whereCondition = "where (material.name like '%" + search + "%' or unittype.name like '%" + search + "%')" + 
        " and material.is_deleted = 0 and material.is_validated = 1";
        if(sess && sess.user){
            con.query("SELECT COUNT(name) AS material FROM material where is_deleted = 0 and is_validated = 1 " , 
            function (err, result, fields){
                if(err) throw err;
                var recordsTotal = result[0].material;
                con.query("select COUNT(material.name) AS name from material inner join unittype on unittype.id = material.unit " + whereCondition, function (err, result, fields){
                    if(err) throw err;
                    var recordsFiltered = result[0].name;
                    con.query("select material.id as id, material.name as name, material.unit as unittype, unittype.name as unitname," + 
                    " unittype.short as unitshort from material inner join unittype on unittype.id = material.unit " 
                    + whereCondition + " order by " + orderColumnTxt + " " + orderDir + " limit " + limit, function (err, result, fields){
                        if(err) throw err;
                        var materialDB = result;
                        var data = [];
                        for (i = 0; i < materialDB.length; i++) { 
                            var buttonView = 
                            "<a href=\"../qamaterialoperation?operation=view&id=" + materialDB[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-success btn-xs\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-search\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qamaterialoperation?operation=edit&id=" + materialDB[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-primary btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-pencil\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" +
                            "<a href=\"../qamaterialoperation?operation=delete&id=" + materialDB[i].id + "\">" +
                                "<button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-left:10px;\">" +
                                    "<span class=\"icon-holder\">" +
                                        "<i class=\"c-white-500 ti-trash\"></i>" +
                                    "</span>" +
                                "</button>" +
                            "</a>" ;
                            data.push({0 : materialDB[i].name, 1 : materialDB[i].unitname + " (" + materialDB[i].unitshort + ")", 2 : buttonView});
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
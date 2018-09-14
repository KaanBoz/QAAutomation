module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qareportoperation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                var id = req.query.id;
                var operation = req.query.operation;
                var followupid = req.query.followupid;
                if(operation == "archive"){
                    con.query("update reportheader set archived = 1 where id=" + id, function(err, result, fields){
                        res.redirect('/qaprintreport');
                    });
                }else{
                    con.query("delete from reportheader where id=" + id, function(err, result, fields){
                        var i = 0;
                        con.query("delete from reportdetail where headerid=" + id, function(err, result, fields){
                            var i = 0;
                            con.query("update qualityfollowup set reported = 0, isreported = 0 where id=" + followupid, function(err, result, fields){
                                var i = 0;
                                res.redirect('/qaprintreport');
                            });
                        });
                    });
                }
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });
    return module;
}
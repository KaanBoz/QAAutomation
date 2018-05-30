module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaeditmasteralloyresult', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var id = req.query.id;
        var sess = req.session;
        var operation = req.query.operation;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                if(operation == "add"){
                    con.query("SELECT qualityfollowup.id, name, partyno, partydate, sender, explanation, " + 
                    "amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis " + 
                    "where qualityfollowup.id = " + id, function(err, result, fields){
                        if (err){
                            console.log(err.message);
                            throw err;    
                        }else{
                            var qfu = result[0];
                            qfu.partydate = getFormattedDate(qfu.partydate);
                            con.query("select analysisheader.details, analysisheader.master_alloy from analysisheader where analysisheader.id = " + id, function(err, result, fields){
                                if (err){
                                    console.log(err.message);
                                    throw err;    
                                }else{
                                    var details = result[0].details;
                                    var master_alloy = result[0].master_alloy;
                                    con.query(
                                        " select material.id as materialid, material.name as materialname, unittype.name as unitname, unittype.short as unitshort, " + 
                                        " analysisdetail.max as max, analysisdetail.min as min from analysisdetail" + 
                                        " inner join material on material.id = analysisdetail.material" +
                                        " inner join unittype on unittype.id = material.unit" +
                                        " where analysisdetail.id in (" + details + ")", function(err, result, fields){
                                        if (err){
                                            console.log(err.message);
                                            throw err;    
                                        }else{
                                            var fields = [];
                                            for(var i = 0; i < result.length; i++){
                                                var field = {};
                                                field.materialid = result[i].materialid;
                                                field.materialname = result[i].materialname;
                                                field.unitname = result[i].unitname;
                                                field.unitshort = result[i].unitshort;
                                                field.max = result[i].max;
                                                field.min = result[i]. min;
                                                field.master_alloy = master_alloy.split(",")[i]
                                                fields.push(field);
                                            }
                                            res.render('qaeditmasteralloyresult', 
                                            { 
                                                data: req.body,
                                                localization : localization,
                                                userName : functions.capitalizeFirstLetter(sess.user.firstname),
                                                userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                                                isAdmin : sess.user.isadmin,
                                                isChef : sess.user.ischef,
                                                isOperator : sess.user.isoperator,
                                                localizationVal : req.body.lang,
                                                qfu : qfu,
                                                fields : JSON.stringify(fields),
                                                field : fields,
                                                id : id
                                            });
                                            return;
                                        }  
                                    });
                                }
                            });                           
                        }
                    });
                }
                
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    app.post('/qaeditmasteralloyresult', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var id = req.query.id;
        var sess = req.session;
        var operation = req.query.operation;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                res.render('qaeditmasteralloyresult', 
                    { 
                        data: req.body,
                        localization : localization,
                        userName : functions.capitalizeFirstLetter(sess.user.firstname),
                        userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                        isAdmin : sess.user.isadmin,
                        isChef : sess.user.ischef,
                        isOperator : sess.user.isoperator,
                        localizationVal : req.body.lang,
                        qfu : qfu
                    });
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
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
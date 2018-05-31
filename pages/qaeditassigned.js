module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qaeditassigned', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var id = req.query.id;
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                con.query("SELECT qualityfollowup.id, name, partyno, partydate, sender, explanation, amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis where qualityfollowup.id = " + id, function(err, result, fields){
                    if (err){
                        console.log(err.message);
                        return;    
                    }
                    var qfu = result[0];
                    qfu.partydate = getFormattedDate(qfu.partydate);
                    res.render('qaeditassigned', 
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
                        id : id
                    });
                    return;
                });
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    app.post('/qaeditassigned', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var id = req.query.id;
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                con.query("select id from masteralloyresult where is_deleted = 0 and followup = " + id, function(err, result, fields){
                    if (err){
                        console.log(err.message);
                        return;    
                    }
                    if(result.length > 0){
                        con.query("select id from analysisresult where is_deleted = 0 and followup = " + id, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                return;    
                            }
                            if(result.length > 0){
                                con.query("update qualityfollowup set isdone = 1 where qualityfollowup.id = " + id, function(err, result, fields){
                                    if (err){
                                        console.log(err.message);
                                        return;    
                                    }
                                    res.redirect("/qaassignedtome");
                                    return;
                                });
                            }else{
                                con.query("SELECT qualityfollowup.id, name, partyno, partydate, sender, explanation, amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis where qualityfollowup.id = " + id, function(err, result, fields){
                                    if (err){
                                        console.log(err.message);
                                        return;    
                                    }
                                    var qfu = result[0];
                                    qfu.partydate = getFormattedDate(qfu.partydate);
                                    res.render('qaeditassigned', 
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
                                        id : id,
                                        message : localization.enterOneOfEach
                                    });
                                    return;
                                });
                            }                            
                        });
                    }else{
                        con.query("SELECT qualityfollowup.id, name, partyno, partydate, sender, explanation, amount FROM qualityfollowup inner join analysisheader on analysisheader.id = qualityfollowup.analysis where qualityfollowup.id = " + id, function(err, result, fields){
                            if (err){
                                console.log(err.message);
                                return;    
                            }
                            var qfu = result[0];
                            qfu.partydate = getFormattedDate(qfu.partydate);
                            res.render('qaeditassigned', 
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
                                id : id,
                                message : localization.enterOneOfEach
                            });
                            return;
                        });
                    }
                    
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
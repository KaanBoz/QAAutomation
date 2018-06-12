module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qacalculation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                var id = req.query.id;
                con.query("SELECT id, analysis, amount FROM qadb.qualityfollowup where id = " + id,
                function(err, result, fields){
                    if(err){
                        throw err;
                    }
                    var followup = result[0];
                    console.log("Uretim Takip ID : " + followup.id + " - Analiz ID : " + followup.analysis + " - Miktar : " + followup.amount);
                    con.query("SELECT id, details, master_alloy FROM qadb.analysisheader where id = " + followup.analysis,
                    function(err, result, fields){
                        if(err){
                            throw err;
                        }
                        var analysis = result[0];
                        console.log("Analiz ID : " + analysis.id + " - Detay IDleri : " + analysis.details + " - Olcum Kulcesi degerleri : " + analysis.master_alloy);
                        con.query("SELECT qadb.material.name, qadb.analysisdetail.id, qadb.analysisdetail.material, max, min FROM qadb.analysisdetail" +
                            " inner join qadb.material on material.id = qadb.analysisdetail.material " +
                            " where qadb.analysisdetail.id in (" + analysis.details + ")",
                        function(err, result, fields){
                            if(err){
                                throw err;
                            }
                            var details = result;
                            for(var i = 0; i < details.length; i++){
                                details[i].master_alloy = parseFloat(analysis.master_alloy.split(",")[i]);
                            }
                            con.query("SELECT result FROM qadb.masteralloyresult where followup =" + followup.id,
                            function(err, result, fields){
                                var masterAlloyResults = [];
                                for(var i = 0; i < result.length; i++){
                                    var variables = result[i].result.split(",");
                                    for(var y = 0; y < variables.length; y++){
                                        if(i==0){
                                            masterAlloyResults[y] = 0;
                                        }
                                        masterAlloyResults[y] += parseFloat(variables[y]);
                                    }
                                }
                                for(var i = 0; i < masterAlloyResults.length; i++){
                                    masterAlloyResults[i] = masterAlloyResults[i] / result.length;
                                    details[i].master_alloy_result = masterAlloyResults[i];
                                }
                                con.query("SELECT result FROM qadb.analysisresult where followup =" + followup.id,
                                    function(err, result, fields){
                                        var analysisResults = [];
                                    for(var i = 0; i < result.length; i++){
                                        var variables = result[i].result.split(",");
                                        for(var y = 0; y < variables.length; y++){
                                            if(i==0){
                                                analysisResults[y] = 0;
                                            }
                                            analysisResults[y] += parseFloat(variables[y]);
                                        }
                                    }
                                    for(var i = 0; i < analysisResults.length; i++){
                                        analysisResults[i] = analysisResults[i] / result.length;
                                        details[i].analysis_result = analysisResults[i];
                                    }
                                    for(var i = 0; i < details.length; i++){
                                        details[i].analysis_result_real =  parseFloat((details[i].analysis_result - (details[i].master_alloy_result - details[i].master_alloy)).toFixed(2));
                                    }
                                    for(var i = 0; i < details.length; i++){
                                        details[i].amount = (followup.amount / 100) * details[i].analysis_result_real;
                                        details[i].fullAmount = parseFloat(followup.amount);
                                        details[i].addedAmount = 0;
                                        details[i].newResult = parseFloat(details[i].analysis_result_real);
                                    }
                                    details = calculate(details);
                                    renderPage(res, req, details); 
                                });
                            });
                        });
                        
                    });                    
                }); 
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    function renderPage(res, req, details){
        res.render('qacalculation', 
        { 
            data: req.body,
            localization : localization,
            userName : functions.capitalizeFirstLetter(sess.user.firstname),
            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
            isAdmin : sess.user.isadmin,
            isChef : sess.user.ischef,
            isOperator : sess.user.isoperator,
            localizationVal : req.body.lang,
            details : details
        });
    }

    function calculate(details){
        var isError = false;
        for(var i = 0; i < details.length; i++){
            if(details[i].newResult < details[i].min){
                details[i].error = 1
                details[i].errorMargin = parseFloat((details[i].min - details[i].newResult).toFixed(2));
                isError = true;
            }else if(details[i].newResult > details[i].max){
                details[i].error = 2
                details[i].errorMargin = parseFloat((details[i].newResult - details[i].max).toFixed(2));
                isError = true;
            }else {
                details[i].error = 0;
                details[i].errorMargin = 0;
            }
        }
        if(!isError){
            return details;
        }else{
            details = fixErrors(details);
            return calculate(details);
        }
    }

    function fixErrors(details){
        var isSmallError = false;
        for(var i = 0; i < details.length; i++){
            if(details[i].error == 1){
                isSmallError = true;
            }
        }
        var isBigError = false;
        for(var i = 0; i < details.length; i++){
            if(details[i].error == 2){
                isBigError = true;
            }
        }
        if(!isSmallError && !isBigError){
            return details;
        }else{
            if(isSmallError){
                details = fixSmallError(details);
                return details
            }
            if(isBigError){
                details = fixBigError(details);
                return details
            }
        }
    }

    function fixSmallError(details){
        for(var i = 0; i < details.length; i++){
            if(details[i].error == 1){
                details[i].addedAmount += (details[i].fullAmount / 100) * details[i].errorMargin;
                break;
            }
        }
        details = reCalculate(details);
        return details;  
    }

    function fixBigError(details){
        for(var i = 0; i < details.length; i++){
            if(details[i].error == 2){
                for(var y = 0; y < details.length; i++){
                    if(i == y) continue;
                    if(details[i].error == 2) continue;
                    details[i].addedAmount += (details[i].fullAmount / 100) * ((details[i].max - details[i].newResult) / 2 );
                    break;
                }
            }
            break;
        }
        details = reCalculate(details);
        return details;  
    }

    function reCalculate(details){
        for(var i = 0; i < details.length; i++){
            details[i].fullAmount = details[i].fullAmount + details[i].addedAmount;
            details[i].amount = details[i].amount + details[i].addedAmount;
            details[i].newResult = details[i].fullAmount / details.newResult
        }
        return details;
    }

    return module;
}



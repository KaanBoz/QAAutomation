module.exports = function (app, myLocalize, functions, con, router, localization) {
    app.get('/qacalculation', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                var id = req.query.id;
                con.query("SELECT id, analysis, amount FROM qualityfollowup where id = " + id,
                function(err, result, fields){
                    if(err){
                        throw err;
                    }
                    var followup = result[0];
                    con.query("SELECT id FROM analysisheader where id = " + followup.analysis,
                    function(err, result, fields){
                        if(err){
                            throw err;
                        }
                        var analysis = result[0];
                        con.query("SELECT material.name, analysisdetail.id, analysisdetail.material, max, min, master as master_alloy FROM analysisdetail" +
                            " inner join material on material.id = analysisdetail.material " +
                            " where analysisdetail.header = " + analysis.id ,
                        function(err, result, fields){
                            if(err){
                                throw err;
                            }
                            var details = result;

                            con.query("SELECT id FROM masteralloyresult where followup =" + followup.id + " and is_deleted = 0",
                            function(err, result, fields){
                                if(err){
                                    throw err;
                                }
                                var masterAlloyIds = [];
                                for(var k = 0; k < result.length; k++){
                                    masterAlloyIds.push(result[k].id);
                                }
                                con.query("SELECT result, detailid FROM masteralloyresultdetails where masteralloy in (" + masterAlloyIds.toString() + ") and is_deleted = 0",
                                function(err, result, fields){
                                    if(err){
                                        throw err;
                                    }
                                    for(var y = 0; y < result.length; y++){
                                        for(var i = 0; i < details.length; i++){
                                            if(!details[i].master_alloy_result){
                                                details[i].master_alloy_result = 0;
                                            }
                                            if(details[i].id == result[y].detailid){
                                                details[i].master_alloy_result += result[y].result;
                                            }
                                        }
                                    }
                                    for(var i = 0; i < details.length; i++){
                                        details[i].master_alloy_result = details[i].master_alloy_result / masterAlloyIds.length;
                                    }
                                    con.query("SELECT id FROM analysisresult where followup =" + followup.id + " and is_deleted = 0",
                                    function(err, result, fields){
                                        if(err){
                                            throw err;
                                        }
                                        var resultIds = [];
                                        for(var k = 0; k < result.length; k++){
                                            resultIds.push(result[k].id);
                                        }
                                        con.query("SELECT result, detailid FROM analysisresultdetails where analysisresult in (" + resultIds.toString() + ") and is_deleted = 0",
                                        function(err, result, fields){
                                            if(err){
                                                throw err;
                                            }
                                            for(var y = 0; y < result.length; y++){
                                                for(var i = 0; i < details.length; i++){
                                                    if(!details[i].analysis_result){
                                                        details[i].analysis_result = 0;
                                                    }
                                                    if(details[i].id == result[y].detailid){
                                                        details[i].analysis_result += result[y].result;
                                                    }
                                                }
                                            }
                                            for(var i = 0; i < details.length; i++){
                                                details[i].analysis_result = details[i].analysis_result / resultIds.length;
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
                                            details.sort(compare);
                                            details = calculate(details);
                                            renderPage(res, req, details); 
                                        });
                                    });
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
        var shouldBreak = false;
        for(var i = 0; i < details.length; i++){
            if(details[i].error == 2){
                for(var y = 0; y < details.length; i++){
                    if(i == y) continue;
                    if(details[y].error == 2) continue;
                    var maxValue = ((details[y].max - details[y].newResult) / 25 );
                    if(details[y].max == 100){
                        var totalMaxValues = 0;
                        for(var z = 0; z < details.length; z++){
                            totalMaxValues += details[z].min;
                        }
                        var biggestMaxValue = 100 - totalMaxValues;
                        maxValue = ((biggestMaxValue - details[y].newResult) / 25 );
                    }
                    details[y].addedAmount += (details[y].fullAmount / 100) * maxValue;
                    shouldBreak = true;
                    break;
                }
            }
            if(shouldBreak){
                break;
            }
        }
        details = reCalculate(details);
        return details;  
    }

    function reCalculate(details){
        var addedAmount = 0;
        for(var i = 0; i < details.length; i++){
            addedAmount += details[i].addedAmount;
        }
        for(var i = 0; i < details.length; i++){
            details[i].fullAmount = details[i].fullAmount + addedAmount;
            details[i].amount = details[i].amount + details[i].addedAmount;
            details[i].newResult = details[i].amount / (details[i].fullAmount/100);
        }
        return details;
    }

    function compare(a,b) {
        if (a.amount < b.amount)
          return 1;
        if (a.amount > b.amount)
          return -1;
        return 0;
    }

    return module;
}



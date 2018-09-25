module.exports = function (app, myLocalize, functions, con, router, localization, pdf, fs, extract, path, formidable) {
    app.get('/qareadpdf', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                res.render('qareadpdf', 
                { 
                    data: req.body,
                    localization : localization,
                    userName : functions.capitalizeFirstLetter(sess.user.firstname),
                    userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                    isAdmin : sess.user.isadmin,
                    isChef : sess.user.ischef,
                    isOperator : sess.user.isoperator,
                    localizationVal : req.body.lang,
                    originalUrl : req.originalUrl
                });
            }else{
                res.redirect('/permissiondenied');
            }          
        }else{
            res.redirect('/');
        }
    });

    app.post('/qareadpdf', function (req, res) {
        functions.setLocale(req, res, null);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.isoperator){
                var form = new formidable.IncomingForm();
                form.parse(req, function (err, fields, files) {
                    if(!files.filetoupload.size){
                        res.render('qareadpdf', 
                        { 
                            data: req.body,
                            localization : localization,
                            userName : functions.capitalizeFirstLetter(sess.user.firstname),
                            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                            isAdmin : sess.user.isadmin,
                            isChef : sess.user.ischef,
                            isOperator : sess.user.isoperator,
                            localizationVal : req.body.lang,
                            originalUrl : req.originalUrl
                        });
                    }
                    extract(files.filetoupload.path, function (err, pages) {
                        if (err) {
                            console.dir(err)
                            return
                        }
                        var firstSplit = pages[0].split('No');
                        var secondSplit = [];
                        for(var i = 2; i < firstSplit.length; i++){
                            secondSplit.push(firstSplit[i].replace(' ', ''));
                        }
                        var thirdSplit = [];
                        for(var i = 0; i < secondSplit.length; i++){
                            var str = secondSplit[i].split('\n');
                            var thirdDummy = [];
                            for(var j = 0; j < str.length; j++){
                                if(j == 1 || !str[j]) continue;
                                thirdDummy.push(str[j]);
                            }
                            thirdSplit.push(thirdDummy);
                        }
                        var elements = [];
                        for(var i = 0; i < thirdSplit.length; i++){    
                            var str = thirdSplit[i][0].split(' '); 
                            for(var z = 0; z < str.length; z++){
                                if(!str[z]) continue;
                                var element = {}
                                element.values = []  
                                element.short = str[z];
                                elements.push(element);
                            }
                        }
                        var values = [];
                        var columns = 0;
                        for(var i = 0; i < thirdSplit.length; i++){
                            for(var j = 1; j <thirdSplit[i].length; j++){
                                var str = thirdSplit[i][j].split(' ');
                                var shouldContinue = false;
                                for(var z = 0; z < str.length; z++){
                                    if(!str[z]) continue;
                                    if(!shouldContinue){
                                        shouldContinue = true;
                                        continue;
                                    }
                                    values.push(str[z].replace('<', ''));
                                } 
                                if(columns == 0){
                                    columns = values.length;
                                } 
                            }   
                        }
                        var numberOfResults = values.length / elements.length;
                        for(var i = 0; i < elements.length; i++){
                            var rowMultiplier = Math.floor(i/columns);
                            var columnMultiplier = elements.length - (rowMultiplier * columns);
                            if(columnMultiplier > columns){
                                columnMultiplier = columns;
                            }
                            for(var j = 0; j < numberOfResults; j++){
                                elements[i].values.push( values[ ((columns * numberOfResults) * rowMultiplier) + (columnMultiplier * j) + i - (columns * rowMultiplier) ] );
                            }
                        }
                        var results = [];
                        for(var i = 0; i < numberOfResults; i++) {
                            var result = {};
                            result.values = [];
                            for(var k = 0; k < elements.length; k++){    
                                var value = {};
                                value.short = elements[k].short;
                                value.value = elements[k].values[i];
                                result.values.push(value);
                            }
                            results.push(result);
                        } 
                        res.render('qareadpdf', 
                        { 
                            data: req.body,
                            localization : localization,
                            userName : functions.capitalizeFirstLetter(sess.user.firstname),
                            userSurname : functions.capitalizeFirstLetter(sess.user.lastname),
                            isAdmin : sess.user.isadmin,
                            isChef : sess.user.ischef,
                            isOperator : sess.user.isoperator,
                            localizationVal : req.body.lang,
                            results : results
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


    return module;
}
module.exports = function (app, myLocalize, functions, con, router, localization, pdf, fs, path, cookie) {
    app.get('/qareport', function (req, res) {
        var orginalLang = cookie.parse(req.headers.cookie || '').lang;
        var lang = req.query.lang;
        functions.setLocale(req, res, lang);
        localization.refresh();
        var sess = req.session;        
        if(sess && sess.user){
            if(sess.user.ischef){
                var id = req.query.id;
                var sql = "select company, customercode, fortecoatproductcode, amount, report, batchno, reportdata, orderno, preparedby, controlledby from reportheader where id =" + id;
                con.query(sql,
                    function(err, result, fields){
                        var data = result[0];
                        sql = "select composition, request, result from reportdetail where headerid =" + id;
                        con.query(sql,
                            function(err, result, fields){
                                data.details = result;
                                createPdf(res, req, data);
                                functions.setLocale(req, res, orginalLang);
                            }
                        );
                    }
                );
            }else{
                res.redirect('/permissiondenied');
                functions.setLocale(req, res, orginalLang);
            }          
        }else{
            res.redirect('/');
            functions.setLocale(req, res, orginalLang);
        }
    });

    function createPdf(res, req, data){
        var imgSrc = 'file://' + __dirname + '/';
        imgSrc = imgSrc.replace('pages/', '');
        imgSrc += "/public/images/reportLogo.png"
        imgSrc = path.normalize(imgSrc);
        var html = 
        "<img src='" + imgSrc + "' width='200' height='75' style='padding-left:10px; float: left;'/>" +
        "<h3 style=\" padding-top:10px; float: left; width:50%; text-align: center;\">" + localization.sentesbirInspectionReport + "</h3>" + 
        "<br />" + 
        "<table>" +
            "<tr>" +
                "<th>" + localization.company + "</th>" +
                "<td>" + data.company + "</td>" +
                "<th>" + localization.report + "</th>" +
                "<td>" + data.report + "</td>" +
            "</tr>"+

            "<tr>" +
                "<th>" + localization.customerCode + "</th>" +
                "<td>" + data.customercode + "</td>" +
                "<th>" + localization.batchNo + "</th>" +
                "<td>" + data.batchno + "</td>" +
            "</tr>"+

            "<tr>" +
                "<th>" + localization.forteCoatProductCode + "</th>" +
                "<td>" + data.fortecoatproductcode + "</td>" +
                "<th>" + localization.reportData + "</th>" +
                "<td>" + data.reportdata + "</td>" +
            "</tr>"+

            "<tr>" +
                "<th>" + localization.amount + "</th>" +
                "<td>" + data.amount + "</td>" +
                "<th>" + localization.orderNo + "</th>" +
                "<td>" + data.orderno + "</td>" +
            "</tr>";


        html += "</table>";

        html += "<br />" + "<br />";

        html += "" +
        "<style>" +

            "html {" +
                "font-family: Arial, Helvetica, sans-serif;" +
            "}" +
            
            "table {" +
                "font-family: arial, sans-serif;" +
                "border-collapse: collapse;" +
                "width: 90%;" +
                "margin-left: 5%;" +
            "}" +

            "td, th {" +
                "border: 1px solid #dddddd;" +
                "text-align: left;" +
                "padding: 8px;" +
                "font-size: 8px;" +
            "}" +
        "</style>" +
        "<table>" +
            "<tr>" +
                "<th>" + localization.composition + "</th>" +
                "<th>" + localization.request + "</th>" +
                "<th>" + localization.result + "</th>" +
            "</tr>";
        for(var i = 0; i < data.details.length; i++){
            html += "<tr>" +
                "<td>" + data.details[i].composition + "</td>" +
                "<td>" + data.details[i].request + "</td>" +
                "<td>" + data.details[i].result + "</td>" +
            "</tr>";
        }
        html += "</table>";
        html += "<div id=\"pageFooter\">" + 
        
        "<table>" +
            "<tr>" +
                "<td>" + "<b>" + localization.preparedBy + " : " + "</b>" + data.preparedby + "</td>" +
                "<td>" + "<b>" + localization.controlledBy + " : " + "</b>" + data.controlledby + "</td>" +
            "</tr>"+
        "</table>" +

        "</div>";
        var options = { format: 'A4' };
        pdf.create(html, options).toFile('./reports/' + data.batchno + '.pdf', function(err, response) {
            if (err) return console.log(err);
            var file = fs.createReadStream('./reports/' + data.batchno + '.pdf');
            var stat = fs.statSync('./reports/' + data.batchno + '.pdf');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + data.batchno + '.pdf');
            file.pipe(res);
        });
    }

    return module;
}



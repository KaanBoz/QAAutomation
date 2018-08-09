module.exports = function(app, mysql, functions, callback){
    //create the connection
    module.dbCreate = mysql.createConnection({
        host: "192.168.2.162",
        user: "kaan",
        //host: "localhost",
        //user: "root",
        password: "12345",
        port: 3306,
    });

    // for specific database connection
    module.con = null;
    module.dbVersion = 0;
    
    module.dbCreate.connect(function(err) {
        if (err){
            console.log(err.message);
        }
        console.log("Connected to database!");
        
        //create the database if not exists
        module.dbCreate.query("CREATE DATABASE IF NOT EXISTS qadb;", function (err, result) {
        if (err){
            console.log(err.message);
        }
        console.log("Database qadb created or exists");
        });
        
        // connect to specified database
        module.con = mysql.createConnection({
            host: "192.168.2.162",
            user: "kaan",
            //host: "localhost",
            //user: "root",
            password: "12345",
            port: 3306,
            database: "qadb",
            multipleStatements: true,
            typeCast: function castField( field, useDefaultTypeCasting ) {
                // We only want to cast bit fields that have a single-bit in them. If the field
                // has more than one bit, then we cannot assume it is supposed to be a Boolean.
                if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
                    var bytes = field.buffer();
                    // A Buffer in Node represents a collection of 8-bit unsigned integers.
                    // Therefore, our single "bit field" comes back as the bits '0000 0001',
                    // which is equivalent to the number 1.
                    return( bytes[ 0 ] === 1 );
        
                }
                return( useDefaultTypeCasting() );
                }
        });

        module.con.connect(function (err){
            if (err) throw err;
            console.log("Connected to qadb database!");
            createDbVersion();    
        });

    });

    function createDbVersion(){
        module.con.query("create table if not exists dbvariables (" + 
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "dbversion INT NOT NULL)"
        , function(err, result, fields){
            if(err) {
                console.log(err.message);
            }else{
                console.log("dbvariables table is created or exists")
                module.con.query("SELECT dbversion from dbvariables", function(err, result, fields){
                    if(err){
                        console.log(err.message);
                    }
                    if(result.length == 0){
                        module.con.query("INSERT INTO dbvariables (dbversion) VALUES (1)", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is created as 1");
                                module.dbVersion = 1;
                                createUsers();   
                            }   
                        });
                    }else{
                        module.dbVersion = result[0].dbversion;
                        console.log("dbversion is " + module.dbVersion);
                        createUsers()
                    }
                });
            }
        });
        return module;
    }

    function createUsers(){
        if(module.dbVersion == 1){
            module.con.query("CREATE TABLE IF NOT EXISTS users (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "firstname VARCHAR(128) NOT NULL,"+
            "lastname VARCHAR(128) NOT NULL,"+
            "mail VARCHAR(128) NOT NULL UNIQUE,"+
            "password VARCHAR(128) NOT NULL,"+
            "isadmin BIT NOT NULL,"+
            "ischef BIT NOT NULL,"+
            "isoperator BIT NOT NULL, "+
            "added_by INT NOT NULL," + 
            "added_at DATETIME NOT NULL," +
            "edited_by INT, " + 
            "edited_at DATETIME, " + 
            "deleted_by INT," + 
            "deleted_at DATETIME, " + 
            "is_deleted BIT NOT NULL, " +
            "is_validated BIT NOT NULL" + 
            ");", function (err, result){
                if (err){
                    console.log(err.message);
                }else{
                    console.log("users table created or exists");
                    module.con.query("SELECT * FROM users", function (err, result, fields) {
                        if (err){
                            console.log(err.message);
                        }else{
                            if(result.length == 0){
                                module.con.query("INSERT INTO users (firstname, lastname, mail, password, isadmin, ischef, isoperator, added_by, added_at, is_deleted, is_validated) VALUES" + 
                                "('admin', 'user', 'admin@sentes-bir.com', '" +functions.encrypt("12345") + "', 1, 0, 0, 1, " + module.con.escape(new Date()) + ", 0, 1)"
                                , function (err, result, fields) {
                                    if (err) throw err;
                                    console.log("Admin user created");
                                    module.con.query("update dbvariables set dbversion = 2 where id = 1", function(err, result, fields){
                                        if(err){
                                            console.log(err.message);
                                        }else{
                                            console.log("dbversion is updated to 2");
                                            module.dbVersion = 2;
                                            createAnalysisType();
                                        }
                                    });
                                });
                            }else{
                                console.log("an user in the database already exists")
                                createAnalysisType();
                            }
                        }
                        
                    });
                }
            });
        }else{
            createAnalysisType();
        }
    }

    function createAnalysisType(){
        if(module.dbVersion == 2){
            module.con.query("CREATE TABLE IF NOT EXISTS analysistype (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "name VARCHAR(128) NOT NULL UNIQUE," +
            "added_by INT NOT NULL," + 
            "added_at DATETIME NOT NULL," +
            "edited_by INT, " + 
            "edited_at DATETIME, " + 
            "deleted_by INT," + 
            "deleted_at DATETIME, " + 
            "is_deleted BIT NOT NULL, " +
            "is_validated BIT NOT NULL" +
            ");", function (err, result){
                if (err){
                    console.log(err.message);
                }else{
                    console.log("analysistype table created or exists");
                    module.con.query("update dbvariables set dbversion = 3 where id = 1", function(err, result, fields){
                        if(err){
                            console.log(err.message);
                        }else{
                            console.log("dbversion is updated to 3");
                            module.dbVersion = 3;
                            createUnitType();
                        }
                    });
                }
            });
        }else{
            createUnitType();
        }
    }

    function createUnitType(){
        if(module.dbVersion == 3){
            module.con.query("CREATE TABLE IF NOT EXISTS unittype (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "name VARCHAR(128) NOT NULL UNIQUE,"+
            "short VARCHAR(128) NOT NULL," +
            "added_by INT NOT NULL," + 
            "added_at DATETIME NOT NULL," +
            "edited_by INT, " + 
            "edited_at DATETIME, " + 
            "deleted_by INT," + 
            "deleted_at DATETIME, " + 
            "is_deleted BIT NOT NULL, " +
            "is_validated BIT NOT NULL" +
            ");", function (err, result){
                if (err){
                    console.log(err.message);
                }else{
                    console.log("unittype table created or exists");
                    module.con.query("update dbvariables set dbversion = 4 where id = 1", function(err, result, fields){
                        if(err){
                            console.log(err.message);
                        }else{
                            console.log("dbversion is updated to 4");
                            module.dbVersion = 4;
                            createAnalysisStandart();
                        }
                    });
                }
            });
        }else{
            createAnalysisStandart();
        }
    }

    function createAnalysisStandart(){
        if(module.dbVersion == 4){
            module.con.query("CREATE TABLE IF NOT EXISTS analysisstandart (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "name VARCHAR(128) NOT NULL UNIQUE," +
            "added_by INT NOT NULL," + 
            "added_at DATETIME NOT NULL," +
            "edited_by INT, " + 
            "edited_at DATETIME, " + 
            "deleted_by INT," + 
            "deleted_at DATETIME, " + 
            "is_deleted BIT NOT NULL, " +
            "is_validated BIT NOT NULL" +
            ");", function (err, result){
                if (err){
                    console.log(err.message);
                }else{
                    console.log("analysisstandart table created or exists");
                    module.con.query("update dbvariables set dbversion = 5 where id = 1", function(err, result, fields){
                        if(err){
                            console.log(err.message);
                        }else{
                            console.log("dbversion is updated to 5");
                            module.dbVersion = 5;
                            createAnalysisHeader();
                        }
                    });
                }
            });
        }else{
            createAnalysisHeader();
        }

        function createAnalysisHeader(){
            if(module.dbVersion == 5){
                module.con.query("CREATE TABLE IF NOT EXISTS analysisheader ("  + 
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "name VARCHAR(256) NOT NULL UNIQUE," +
                "type INT NOT NULL," +
                "standart INT NOT NULL," +
                "details VARCHAR(512) NOT NULL," +
                "master_alloy VARCHAR(256) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ")"
                    , function (err, result){
                        if (err){
                            console.log(err.message);
                        }else{
                            console.log("analysisstandart table created or exists");
                            module.con.query("update dbvariables set dbversion = 6 where id = 1", function(err, result, fields){
                                if(err){
                                    console.log(err.message);
                                }else{
                                    console.log("dbversion is updated to 6");
                                    module.dbVersion = 6;
                                    createAnalysisDetails();
                                }
                            });
                        }
                });
            }else{
                createAnalysisDetails();
            }
        }

        function createAnalysisDetails(){
            if(module.dbVersion == 6){
                module.con.query("CREATE TABLE IF NOT EXISTS analysisdetail ("  + 
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "material INT NOT NULL," +
                "max FLOAT(10,3) NOT NULL," +
                "min FLOAT(10,3) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL," +
                "UNIQUE KEY unique_analysisdetail (material, max, min)" +
                ")"
                    , function (err, result){
                        if (err){
                            console.log(err.message);
                        }else{
                            console.log("analysisdetail table created or exists");
                            module.con.query("update dbvariables set dbversion = 7 where id = 1", function(err, result, fields){
                                if(err){
                                    console.log(err.message);
                                }else{
                                    console.log("dbversion is updated to 7");
                                    module.dbVersion = 7;
                                    createMaterial();
                                }
                            });
                        }
                });
            }else{
                createMaterial();
            }
        }

        function createMaterial(){
            if(module.dbVersion == 7){
                module.con.query("CREATE TABLE IF NOT EXISTS material (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "name VARCHAR(128) NOT NULL UNIQUE,"+
                "unit INT NOT NULL," +
                "is_multiple BIT NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("material table created or exists");
                        module.con.query("update dbvariables set dbversion = 8 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 8");
                                module.dbVersion = 8;
                                createQualityFollowup();
                            }
                        });
                    }
                });
            }else{
                createQualityFollowup();
            }
        }

        function createQualityFollowup(){
            if(module.dbVersion == 8){
                module.con.query("CREATE TABLE IF NOT EXISTS qualityfollowup (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "partyno VARCHAR(128) NOT NULL,"+
                "partydate DATETIME NOT NULL," +
                "assignedto INT NOT NULL," +
                "analysis INT NOT NULL," +
                "sender VARCHAR(256),"+
                "explanation VARCHAR(256),"+
                "isdone BIT NOT NULL, " +
                "isreported BIT NOT NULL, " +
                "amount FLOAT(10,3) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL," +
                "UNIQUE KEY unique_analysisdetail (partyno, analysis)" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("qualityfollowup table created or exists");
                        module.con.query("update dbvariables set dbversion = 9 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 9");
                                module.dbVersion = 9;
                                createMasterAlloyResult();
                            }
                        });
                    }
                });
            }else{
                createMasterAlloyResult();
            }
        }


        function createMasterAlloyResult(){
            if(module.dbVersion == 9){
                module.con.query("CREATE TABLE IF NOT EXISTS masteralloyresult (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "analysis INT NOT NULL," +
                "followup INT NOT NULL," +
                "result VARCHAR(512) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("masteralloyresult table created or exists");
                        module.con.query("update dbvariables set dbversion = 10 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 10");
                                module.dbVersion = 10;
                                createAnalysisResult();
                            }
                        });
                    }
                });
            }else{
                createAnalysisResult();
            }
        }


        function createAnalysisResult(){
            if(module.dbVersion == 10){
                module.con.query("CREATE TABLE IF NOT EXISTS analysisresult (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "analysis INT NOT NULL," +
                "followup INT NOT NULL," +
                "result VARCHAR(512) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("analysisresult table created or exists");
                        module.con.query("update dbvariables set dbversion = 11 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 11");
                                module.dbVersion = 11;
                                collationFix();
                            }
                        });
                    }
                });
            }else{
                collationFix();
            }
        }

        function collationFix(){
            if(module.dbVersion == 11){
                module.con.query(
                    " ALTER DATABASE qadb CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER DATABASE qadb DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE analysisdetail CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE analysisheader CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE analysisresult CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE analysisstandart CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE analysistype CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE dbvariables CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" +
                    " ALTER TABLE masteralloyresult CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" + 
                    " ALTER TABLE material CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" + 
                    " ALTER TABLE qualityfollowup CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" + 
                    " ALTER TABLE unittype CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" + 
                    " ALTER TABLE users CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;" + 
                    ""
                    , function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        module.con.query("update dbvariables set dbversion = 12 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 12");
                                module.dbVersion = 12;
                                dbVersion13();
                            }
                        });
                    }
                });
            }else{
                dbVersion13();
            }
        }

        function dbVersion13(){
            if(module.dbVersion == 12){
                module.con.query(
                    "ALTER TABLE analysisheader DROP COLUMN details; " + 
                    "ALTER TABLE analysisheader DROP COLUMN master_alloy;"
                    , function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        module.con.query("update dbvariables set dbversion = 13 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 13");
                                module.dbVersion = 13;
                                dbVersion14();
                            }
                        });
                    }
                });
            }else{
                dbVersion14();
            }
        }

        function dbVersion14(){
            if(module.dbVersion == 13){
                module.con.query(
                    "ALTER TABLE analysisdetail ADD master FLOAT(10,3) NOT NULL;" + 
                    "ALTER TABLE analysisdetail ADD header INT NOT NULL;" +
                    "ALTER TABLE analysisdetail DROP INDEX unique_analysisdetail;"
                    , function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        module.con.query("update dbvariables set dbversion = 14 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 14");
                                module.dbVersion = 14;
                                dbVersion15();
                            }
                        });
                    }
                });
            }else{
                dbVersion15();
            }
        }

        function dbVersion15(){
            if(module.dbVersion == 14){
                module.con.query(
                    "ALTER TABLE masteralloyresult DROP COLUMN result; " +
                    "ALTER TABLE analysisresult DROP COLUMN result; "
                    , function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        module.con.query("update dbvariables set dbversion = 15 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 15");
                                module.dbVersion = 15;
                                createMasterAlloyResultDetails();
                            }
                        });
                    }
                });
            }else{
                createMasterAlloyResultDetails();
            }
        }

        //masteralloyresult
        function createMasterAlloyResultDetails(){
            if(module.dbVersion == 15){
                module.con.query("CREATE TABLE IF NOT EXISTS masteralloyresultdetails (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "masteralloy INT NOT NULL," +
                "detailid INT NOT NULL," +
                "result FLOAT(10,3) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("masteralloyresultdetails table created or exists");
                        module.con.query("update dbvariables set dbversion = 16 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 16");
                                module.dbVersion = 16;
                                createAnalysisResultDetails();
                            }
                        });
                    }
                });
            }else{
                createAnalysisResultDetails();
            }
        }

        function createAnalysisResultDetails(){
            if(module.dbVersion == 16){
                module.con.query("CREATE TABLE IF NOT EXISTS analysisresultdetails (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "analysisresult INT NOT NULL," +
                "detailid INT NOT NULL," +
                "result FLOAT(10,3) NOT NULL," +
                "added_by INT NOT NULL," + 
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " + 
                "edited_at DATETIME, " + 
                "deleted_by INT," + 
                "deleted_at DATETIME, " + 
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log("analysisresultdetails table created or exists");
                        module.con.query("update dbvariables set dbversion = 17 where id = 1", function(err, result, fields){
                            if(err){
                                console.log(err.message);
                            }else{
                                console.log("dbversion is updated to 17");
                                module.dbVersion = 17;
                                callback();
                            }
                        });
                    }
                });
            }else{
                callback();
            }
        }

    }


    //return the module
    return module;




}
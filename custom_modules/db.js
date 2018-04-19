module.exports = function(app, mysql, functions, callback){
    //create the connection
    module.dbCreate = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "12345",
        port: 3306
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
            host: "localhost",
            user: "root",
            password: "12345",
            port: 3306,
            database: "qadb",
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
                                module.con.query("INSERT INTO USERS (firstname, lastname, mail, password, isadmin, ischef, isoperator, added_by, added_at, is_deleted, is_validated) VALUES" + 
                                "('admin', 'user', 'admin@sentes-bir.com', '" +functions.encrypt("12345") + "', 1, 1, 1, 1, " + module.con.escape(new Date()) + ", 0, 1)"
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
            "short VARCHAR(128) NOT NULL UNIQUE," +
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
                            createAnalysisType();
                        }
                    });
                }
            });
        }else{
            createAnalysisType();
        }
    }

    function createAnalysisType(){
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
                            callback();
                        }
                    });
                }
            });
        }else{
            callback();
        }
    }


    //return the module
    return module;




}
module.exports = function (app, mysql, functions, callback) {
    //create the connection
    module.dbCreate = mysql.createConnection({
        //host: "192.168.2.162",
        //user: "kaan",
        host: "localhost",
        user: "root",
        password: "12345",
        port: 3306,
    });

    // for specific database connection
    module.con = null;
    module.dbVersion = 0;

    module.dbCreate.connect(function (err) {
        if (err) {
            console.log(err.message);
        }
        console.log("Connected to database!");

        //create the database if not exists
        module.dbCreate.query("CREATE DATABASE IF NOT EXISTS qadb;", function (err, result) {
            if (err) {
                console.log(err.message);
            }
            console.log("Database qadb created or exists");
        });

        // connect to specified database
        module.con = mysql.createConnection({
            //host: "192.168.2.162",
            //user: "kaan",
            host: "localhost",
            user: "root",
            password: "12345",
            port: 3306,
            database: "qadb",
            multipleStatements: true,
            typeCast: function castField(field, useDefaultTypeCasting) {
                // We only want to cast bit fields that have a single-bit in them. If the field
                // has more than one bit, then we cannot assume it is supposed to be a Boolean.
                if ((field.type === "BIT") && (field.length === 1)) {
                    var bytes = field.buffer();
                    // A Buffer in Node represents a collection of 8-bit unsigned integers.
                    // Therefore, our single "bit field" comes back as the bits '0000 0001',
                    // which is equivalent to the number 1.
                    return (bytes[0] === 1);

                }
                return (useDefaultTypeCasting());
            }
        });

        module.con.connect(function (err) {
            if (err) throw err;
            console.log("Connected to qadb database!");
            createDbVersion();
        });

    });

    function createDbVersion() {
        module.con.query("create table if not exists dbvariables (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
            "dbversion INT NOT NULL)"
            , function (err, result, fields) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("dbvariables table is created or exists")
                    module.con.query("SELECT dbversion from dbvariables", function (err, result, fields) {
                        if (err) {
                            console.log(err.message);
                        }
                        if (result.length == 0) {
                            module.con.query("INSERT INTO dbvariables (dbversion) VALUES (1)", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is created as 1");
                                    module.dbVersion = 1;
                                    createUsers();
                                }
                            });
                        } else {
                            module.dbVersion = result[0].dbversion;
                            console.log("dbversion is " + module.dbVersion);
                            createUsers()
                        }
                    });
                }
            });
        return module;
    }

    function createUsers() {
        if (module.dbVersion == 1) {
            module.con.query("CREATE TABLE IF NOT EXISTS users (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "firstname VARCHAR(128) NOT NULL," +
                "lastname VARCHAR(128) NOT NULL," +
                "mail VARCHAR(128) NOT NULL UNIQUE," +
                "password VARCHAR(128) NOT NULL," +
                "isadmin BIT NOT NULL," +
                "ischef BIT NOT NULL," +
                "isoperator BIT NOT NULL, " +
                "added_by INT NOT NULL," +
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " +
                "edited_at DATETIME, " +
                "deleted_by INT," +
                "deleted_at DATETIME, " +
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");", function (err, result) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log("users table created or exists");
                        module.con.query("SELECT * FROM users", function (err, result, fields) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                if (result.length == 0) {
                                    module.con.query("INSERT INTO users (firstname, lastname, mail, password, isadmin, ischef, isoperator, added_by, added_at, is_deleted, is_validated) VALUES" +
                                        "('admin', 'user', 'admin@sentes-bir.com', '" + functions.encrypt("12345") + "', 1, 0, 0, 1, " + module.con.escape(new Date()) + ", 0, 1)"
                                        , function (err, result, fields) {
                                            if (err) throw err;
                                            console.log("Admin user created");
                                            module.con.query("update dbvariables set dbversion = 2 where id = 1", function (err, result, fields) {
                                                if (err) {
                                                    console.log(err.message);
                                                } else {
                                                    console.log("dbversion is updated to 2");
                                                    module.dbVersion = 2;
                                                    createAnalysisType();
                                                }
                                            });
                                        });
                                } else {
                                    console.log("an user in the database already exists")
                                    createAnalysisType();
                                }
                            }

                        });
                    }
                });
        } else {
            createAnalysisType();
        }
    }

    function createAnalysisType() {
        if (module.dbVersion == 2) {
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
                ");", function (err, result) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log("analysistype table created or exists");
                        module.con.query("update dbvariables set dbversion = 3 where id = 1", function (err, result, fields) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                console.log("dbversion is updated to 3");
                                module.dbVersion = 3;
                                createUnitType();
                            }
                        });
                    }
                });
        } else {
            createUnitType();
        }
    }

    function createUnitType() {
        if (module.dbVersion == 3) {
            module.con.query("CREATE TABLE IF NOT EXISTS unittype (" +
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                "name VARCHAR(128) NOT NULL UNIQUE," +
                "short VARCHAR(128) NOT NULL," +
                "added_by INT NOT NULL," +
                "added_at DATETIME NOT NULL," +
                "edited_by INT, " +
                "edited_at DATETIME, " +
                "deleted_by INT," +
                "deleted_at DATETIME, " +
                "is_deleted BIT NOT NULL, " +
                "is_validated BIT NOT NULL" +
                ");" +
                "insert into unittype (id, name, short, added_by, added_at, edited_by, edited_at, deleted_by, deleted_at, is_deleted, is_validated )" +
                " values(1, 'Yüzde', '%', '1', '2018-07-03 17:35:17', NULL, NULL, NULL, NULL, 0, 1);", function (err, result) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log("unittype table created or exists");
                        module.con.query("update dbvariables set dbversion = 4 where id = 1", function (err, result, fields) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                console.log("dbversion is updated to 4");
                                module.dbVersion = 4;
                                createAnalysisStandart();
                            }
                        });
                    }
                });
        } else {
            createAnalysisStandart();
        }
    }

    function createAnalysisStandart() {
        if (module.dbVersion == 4) {
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
                ");", function (err, result) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log("analysisstandart table created or exists");
                        module.con.query("update dbvariables set dbversion = 5 where id = 1", function (err, result, fields) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                console.log("dbversion is updated to 5");
                                module.dbVersion = 5;
                                createAnalysisHeader();
                            }
                        });
                    }
                });
        } else {
            createAnalysisHeader();
        }

        function createAnalysisHeader() {
            if (module.dbVersion == 5) {
                module.con.query("CREATE TABLE IF NOT EXISTS analysisheader (" +
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
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("analysisstandart table created or exists");
                            module.con.query("update dbvariables set dbversion = 6 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 6");
                                    module.dbVersion = 6;
                                    createAnalysisDetails();
                                }
                            });
                        }
                    });
            } else {
                createAnalysisDetails();
            }
        }

        function createAnalysisDetails() {
            if (module.dbVersion == 6) {
                module.con.query("CREATE TABLE IF NOT EXISTS analysisdetail (" +
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
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("analysisdetail table created or exists");
                            module.con.query("update dbvariables set dbversion = 7 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 7");
                                    module.dbVersion = 7;
                                    createMaterial();
                                }
                            });
                        }
                    });
            } else {
                createMaterial();
            }
        }

        function createMaterial() {
            if (module.dbVersion == 7) {
                module.con.query("CREATE TABLE IF NOT EXISTS material (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "name VARCHAR(128) NOT NULL UNIQUE," +
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("material table created or exists");
                            module.con.query("update dbvariables set dbversion = 8 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 8");
                                    module.dbVersion = 8;
                                    createQualityFollowup();
                                }
                            });
                        }
                    });
            } else {
                createQualityFollowup();
            }
        }

        function createQualityFollowup() {
            if (module.dbVersion == 8) {
                module.con.query("CREATE TABLE IF NOT EXISTS qualityfollowup (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "partyno VARCHAR(128) NOT NULL," +
                    "partydate DATETIME NOT NULL," +
                    "assignedto INT NOT NULL," +
                    "analysis INT NOT NULL," +
                    "sender VARCHAR(256)," +
                    "explanation VARCHAR(256)," +
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("qualityfollowup table created or exists");
                            module.con.query("update dbvariables set dbversion = 9 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 9");
                                    module.dbVersion = 9;
                                    createMasterAlloyResult();
                                }
                            });
                        }
                    });
            } else {
                createMasterAlloyResult();
            }
        }


        function createMasterAlloyResult() {
            if (module.dbVersion == 9) {
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("masteralloyresult table created or exists");
                            module.con.query("update dbvariables set dbversion = 10 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 10");
                                    module.dbVersion = 10;
                                    createAnalysisResult();
                                }
                            });
                        }
                    });
            } else {
                createAnalysisResult();
            }
        }


        function createAnalysisResult() {
            if (module.dbVersion == 10) {
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("analysisresult table created or exists");
                            module.con.query("update dbvariables set dbversion = 11 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 11");
                                    module.dbVersion = 11;
                                    collationFix();
                                }
                            });
                        }
                    });
            } else {
                collationFix();
            }
        }

        function collationFix() {
            if (module.dbVersion == 11) {
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
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 12 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 12");
                                    module.dbVersion = 12;
                                    dbVersion13();
                                }
                            });
                        }
                    });
            } else {
                dbVersion13();
            }
        }

        function dbVersion13() {
            if (module.dbVersion == 12) {
                module.con.query(
                    "ALTER TABLE analysisheader DROP COLUMN details; " +
                    "ALTER TABLE analysisheader DROP COLUMN master_alloy;"
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 13 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 13");
                                    module.dbVersion = 13;
                                    dbVersion14();
                                }
                            });
                        }
                    });
            } else {
                dbVersion14();
            }
        }

        function dbVersion14() {
            if (module.dbVersion == 13) {
                module.con.query(
                    "ALTER TABLE analysisdetail ADD master FLOAT(10,3) NOT NULL;" +
                    "ALTER TABLE analysisdetail ADD header INT NOT NULL;" +
                    "ALTER TABLE analysisdetail DROP INDEX unique_analysisdetail;"
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 14 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 14");
                                    module.dbVersion = 14;
                                    dbVersion15();
                                }
                            });
                        }
                    });
            } else {
                dbVersion15();
            }
        }

        function dbVersion15() {
            if (module.dbVersion == 14) {
                module.con.query(
                    "ALTER TABLE masteralloyresult DROP COLUMN result; " +
                    "ALTER TABLE analysisresult DROP COLUMN result; "
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 15 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 15");
                                    module.dbVersion = 15;
                                    createMasterAlloyResultDetails();
                                }
                            });
                        }
                    });
            } else {
                createMasterAlloyResultDetails();
            }
        }

        //masteralloyresult
        function createMasterAlloyResultDetails() {
            if (module.dbVersion == 15) {
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("masteralloyresultdetails table created or exists");
                            module.con.query("update dbvariables set dbversion = 16 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 16");
                                    module.dbVersion = 16;
                                    createAnalysisResultDetails();
                                }
                            });
                        }
                    });
            } else {
                createAnalysisResultDetails();
            }
        }

        function createAnalysisResultDetails() {
            if (module.dbVersion == 16) {
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
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("analysisresultdetails table created or exists");
                            module.con.query("update dbvariables set dbversion = 17 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 17");
                                    module.dbVersion = 17;
                                    dbVersion18();
                                }
                            });
                        }
                    });
            } else {
                dbVersion18();
            }
        }

        function dbVersion18() {
            if (module.dbVersion == 17) {
                module.con.query(
                    "ALTER TABLE material ADD short VARCHAR(256) NOT NULL; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 18 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 18");
                                    module.dbVersion = 18;
                                    dbVersion19();
                                }
                            });
                        }
                    });
            } else {
                dbVersion19();
            }
        }

        function dbVersion19() {
            if (module.dbVersion == 18) {
                module.con.query(
                    "ALTER TABLE qualityfollowup ADD reported BIT NOT NULL DEFAULT 0; " +
                    "ALTER TABLE qualityfollowup ADD calculated BIT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 19 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 19");
                                    module.dbVersion = 19;
                                    dbVersion20();
                                }
                            });
                        }
                    });
            } else {
                dbVersion20();
            }
        }

        function dbVersion20() {
            if (module.dbVersion == 19) {
                module.con.query(
                    "ALTER TABLE qualityfollowup ADD done BIT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 20 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 20");
                                    module.dbVersion = 20;
                                    createReportHeader();
                                }
                            });
                        }
                    });
            } else {
                createReportHeader();
            }
        }

        function createReportHeader() {
            if (module.dbVersion == 20) {
                module.con.query("CREATE TABLE IF NOT EXISTS reportheader (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "company VARCHAR(256)," +
                    "customercode VARCHAR(256)," +
                    "fortecoatproductcode VARCHAR(256)," +
                    "amount VARCHAR(256)," +
                    "report VARCHAR(256)," +
                    "batchno VARCHAR(256)," +
                    "reportdata VARCHAR(256)," +
                    "orderno VARCHAR(256)," +
                    "preparedby VARCHAR(256)," +
                    "controlledby VARCHAR(256)," +
                    "analysisheaderid INT NOT NULL," +
                    "archived BIT NOT NULL DEFAULT 0, " +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("reportheader table created or exists");
                            module.con.query("update dbvariables set dbversion = 21 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 21");
                                    module.dbVersion = 21;
                                    createReportDetail();
                                }
                            });
                        }
                    });
            } else {
                createReportDetail();
            }
        }

        function createReportDetail() {
            if (module.dbVersion == 21) {
                module.con.query("CREATE TABLE IF NOT EXISTS reportdetail (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "headerid INT NOT NULL," +
                    "analysisheaderid INT NOT NULL," +
                    "analysisdetailid INT NOT NULL," +
                    "composition VARCHAR(256)," +
                    "request VARCHAR(256)," +
                    "result VARCHAR(256)," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("reportdetail table created or exists");
                            module.con.query("update dbvariables set dbversion = 22 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 22");
                                    module.dbVersion = 22;
                                    dbVersion23();
                                }
                            });
                        }
                    });
            } else {
                dbVersion23();
            }
        }

        function dbVersion23() {
            if (module.dbVersion == 22) {
                module.con.query(
                    "ALTER TABLE qualityfollowup ADD nocorrection BIT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 23 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 23");
                                    module.dbVersion = 23;
                                    createCorrectionHeader();
                                }
                            });
                        }
                    });
            } else {
                createCorrectionHeader();
            }
        }

        function createCorrectionHeader() {
            if (module.dbVersion == 23) {
                module.con.query("CREATE TABLE IF NOT EXISTS correctionheader (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "analysisname VARCHAR(256)," +
                    "analysisid INT NOT NULL," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("correctionheader table created or exists");
                            module.con.query("update dbvariables set dbversion = 24 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 24");
                                    module.dbVersion = 24;
                                    createCorrectionDetail();
                                }
                            });
                        }
                    });
            } else {
                createCorrectionDetail();
            }
        }

        function createCorrectionDetail() {
            if (module.dbVersion == 24) {
                module.con.query("CREATE TABLE IF NOT EXISTS correctiondetails (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "name VARCHAR(256)," +
                    "addedamount VARCHAR(256)," +
                    "headerid INT NOT NULL," +
                    "analysisdetailid  INT NOT NULL," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("correctiondetails table created or exists");
                            module.con.query("update dbvariables set dbversion = 25 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 25");
                                    module.dbVersion = 25;
                                    dbVersion26();
                                }
                            });
                        }
                    });
            } else {
                dbVersion26();
            }
        }

        function dbVersion26() {
            if (module.dbVersion == 25) {
                module.con.query(
                    "ALTER TABLE correctionheader ADD archived BIT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 26 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 26");
                                    module.dbVersion = 26;
                                    dbVersion27();
                                }
                            });
                        }
                    });
            } else {
                dbVersion27();
            }
        }

        function dbVersion27() {
            if (module.dbVersion == 26) {
                module.con.query(
                    "ALTER TABLE correctionheader ADD owner INT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 27 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 27");
                                    module.dbVersion = 27;
                                    dbVersion28();
                                }
                            });
                        }
                    });
            } else {
                dbVersion28();
            }
        }

        function dbVersion28() {
            if (module.dbVersion == 27) {
                module.con.query(
                    "ALTER TABLE reportheader ADD followupid INT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 28 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 28");
                                    module.dbVersion = 28;
                                    dbVersion29();
                                }
                            });
                        }
                    });
            } else {
                dbVersion29();
            }
        }

        function dbVersion29() {
            if (module.dbVersion == 28) {
                module.con.query("CREATE TABLE IF NOT EXISTS product (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "alloyNoCode VARCHAR(256)," +
                    "alloyNoEx VARCHAR(256)," +
                    "productionTypeCode VARCHAR(256)," +
                    "productionTypeEx VARCHAR(256)," +
                    "productDetail1Code VARCHAR(256)," +
                    "productDetail1Ex VARCHAR(256)," +
                    "productDetail2Code VARCHAR(256)," +
                    "productDetail2Ex VARCHAR(256)," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");", function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("product table created or exists");
                            module.con.query("update dbvariables set dbversion = 29 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 29");
                                    module.dbVersion = 29;
                                    dbVersion30();
                                }
                            });
                        }
                    });
            } else {
                dbVersion30();
            }
        }

        function dbVersion30() {
            if (module.dbVersion == 29) {
                module.con.query(
                    "ALTER TABLE product CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 30 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 30");
                                    module.dbVersion = 30;
                                    dbVersion31();
                                }
                            });
                        }
                    });
            } else {
                dbVersion31();
            }
        }

        function dbVersion31() {
            if (module.dbVersion == 30) {
                module.con.query("CREATE TABLE IF NOT EXISTS customer (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "customername VARCHAR(256)," +
                    "responsibleperson VARCHAR(256)," +
                    "telephone VARCHAR(256)," +
                    "email VARCHAR(256)," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");" +
                    "ALTER TABLE customer CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
                    , function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("customer table created or exists");
                            module.con.query("update dbvariables set dbversion = 31 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 31");
                                    module.dbVersion = 31;
                                    dbVersion32();
                                }
                            });
                        }
                    });
            } else {
                dbVersion32();
            }
        }

        function dbVersion32() {
            if (module.dbVersion == 31) {
                module.con.query(
                    "ALTER TABLE analysisheader ADD customer INT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 32 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 32");
                                    module.dbVersion = 32;
                                    dbVersion33();
                                }
                            });
                        }
                    });
            } else {
                dbVersion33();
            }
        }

        function dbVersion33() {
            if (module.dbVersion == 32) {
                module.con.query(
                    "ALTER TABLE analysisheader ADD alloy INT NOT NULL DEFAULT 0; ",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 33 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 33");
                                    module.dbVersion = 33;
                                    dbVersion34();
                                }
                            });
                        }
                    });
            } else {
                dbVersion34();
            }
        }

        function dbVersion34() {
            if (module.dbVersion == 33) {
                module.con.query(
                    "ALTER TABLE qualityfollowup ADD customer INT NOT NULL DEFAULT 0;" +
                    "ALTER TABLE qualityfollowup ADD doublecheck BIT NOT NULL DEFAULT 0;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 34 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 34");
                                    module.dbVersion = 34;
                                    dbVersion35();
                                }
                            });
                        }
                    });
            } else {
                dbVersion35();
            }
        }

        function dbVersion35() {
            if (module.dbVersion == 34) {
                module.con.query(
                    "ALTER TABLE qualityfollowup ADD derivedfrom INT NOT NULL DEFAULT 0;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 35 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 35");
                                    module.dbVersion = 35;
                                    dbVersion36();
                                }
                            });
                        }
                    });
            } else {
                dbVersion36();
            }
        }

        function dbVersion36() {
            if (module.dbVersion == 35) {
                module.con.query(
                    "ALTER TABLE analysisheader DROP INDEX name;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 36 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 36");
                                    module.dbVersion = 36;
                                    dbVersion37();
                                }
                            });
                        }
                    });
            } else {
                dbVersion37();
            }
        }

        function dbVersion37() {
            if (module.dbVersion == 36) {
                module.con.query(
                    "ALTER TABLE qualityfollowup DROP INDEX unique_analysisdetail;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 37 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 37");
                                    module.dbVersion = 37;
                                    dbVersion38();
                                }
                            });
                        }
                    });
            } else {
                dbVersion38();
            }
        }

        function dbVersion38() {
            if (module.dbVersion == 37) {
                module.con.query(
                    "ALTER TABLE correctionheader ADD explanation NVARCHAR(256);",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 38 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 38");
                                    module.dbVersion = 38;
                                    dbVersion39();
                                }
                            });
                        }
                    });
            } else {
                dbVersion39();
            }
        }

        function dbVersion39() {
            if (module.dbVersion == 38) {
                module.con.query(
                    "CREATE TABLE IF NOT EXISTS customerproduct (" +
                    "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
                    "customer INT," +
                    "product INT," +
                    "added_by INT NOT NULL," +
                    "added_at DATETIME NOT NULL," +
                    "edited_by INT, " +
                    "edited_at DATETIME, " +
                    "deleted_by INT," +
                    "deleted_at DATETIME, " +
                    "is_deleted BIT NOT NULL, " +
                    "is_validated BIT NOT NULL" +
                    ");" +
                    "ALTER TABLE customerproduct CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 39 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 39");
                                    module.dbVersion = 39;
                                    dbVersion40();
                                }
                            });
                        }
                    });
            } else {
                dbVersion40();
            }
        }

        function dbVersion40() {
            if (module.dbVersion == 39) {
                module.con.query(
                    "ALTER TABLE correctionheader ADD qualityfollowup INT;",
                    function (err, result) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            module.con.query("update dbvariables set dbversion = 40 where id = 1", function (err, result, fields) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("dbversion is updated to 40");
                                    module.dbVersion = 40;
                                    callback();
                                }
                            });
                        }
                    });
            } else {
                callback();
            }
        }

    }


    //

    //return the module
    return module;




}
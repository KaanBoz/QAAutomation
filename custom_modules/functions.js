module.exports = function(app, cookie, myLocalize, sha512, crypto, algorithm, password) {
    module.setLocale = function(req, res, lang){
        if(lang == null){
            lang = cookie.parse(req.headers.cookie || '').lang;
        }
        if(lang == null){
            lang = 'tr';
        }
        req.body.lang = lang;
        res.setHeader(
            'Set-Cookie', 
            cookie.serialize('lang', lang),
            {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7
            }
        );
        myLocalize.setLocale(lang);
    }
    module.getSha512 = function getSha512(text){
        return sha512('' + text).toString('hex');
    }
    module.capitalizeFirstLetter = function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    module.validateEmail =function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    module.encrypt = function encrypt(text){
        var cipher = crypto.createCipher(algorithm,password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    } 
    module.decrypt = function decrypt(text){
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
    return module;
}
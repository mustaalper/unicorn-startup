var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local'),
    methodOverride  = require('method-override'),
    User            = require("./models/user"),
    Company         = require("./models/company");

mongoose.connect("mongodb://localhost/Unicorn", {useMongeClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//Passport Config
app.use(require("express-session")({
  secret : "Gizli Cümlemiz",
  resave : false,
  saveUninitialized : false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Tüm Route ile paylaşılan bilgiler
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

//yorum yorum yorum gitm

//============
/*app.get("/", function(req, res){
  res.render("home");
});*/
app.get("/", function(req, res){
  Company.find({}, function(err, companiesDB){
    if(err){
      console.log(err);
    } else {
      console.log("**********ŞİRKETLER**********");
      console.log(companiesDB);
      res.render("companies/companies", {companies: companiesDB});
    }
  });
});

app.get("/companies", function(req, res){
  Company.find({}, function(err, companiesDB){
    if(err){
      console.log(err);
    } else {
      console.log("**********ŞİRKETLER**********");
      console.log(companiesDB);
      res.render("companies/companies", {companies: companiesDB});
    }
  });
});

app.post("/companies", userLogin, function(req, res){
  var name      = req.body.name;
  var logo      = req.body.logo;
  var value     = req.body.value;
  var flag      = req.body.flag;
  var comment   = req.body.comment;
  var founded   = req.body.founded;
  var became    = req.body.became;

  var newCompany = {name: name, logo: logo, value: value, flag: flag, comment: comment, founded: founded, became: became}

  //yeni şirket oluştur ve DBye kaydet
  Company.create(newCompany, function(err, newCreatedCompany){
    if(err){
      console.log(err);
      res.redirect("/");
    } else {
      res.redirect("/companies");
    }
  });
});

app.get("/companies/new", userLogin, function(req, res){
  res.render("companies/new");
});

app.get("/companies/:id", function(req, res){
  Company.findById(req.params.id).exec(function(err, basedCompany){
    if(err){
      console.log(err);
    } else {
      res.render("companies/show", {companies : basedCompany});
    }
  });
});

//Şirketleri güncelle
app.get("/companies/:id/edit", userLogin, function(req, res){
  Company.findById(req.params.id, function(err, basedCompany){
    if(err){
      console.log(err);
      res.redirect("/company");
    } else {
      res.render("companies/edit", {company : basedCompany});
    }
  });
});

app.put("/companies/:id", userLogin, function(req, res){
  Company.findByIdAndUpdate(req.params.id, req.body.company, function(err, uptadetCompany){
    if(err){
      console.log(err);
      res.redirect("/companies");
    } else {
      res.redirect("/companies/" + req.params.id);
    }
  });
});

//Şirketleri Silme
app.delete("/companies/:id", userLogin, function(req, res){
  Company.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log(err);
      res.redirect("/companies");
    } else {
      res.redirect("/companies");
    }
  });
});

//USER Route
app.get("/user/:id/profile", userLogin, function(req, res){
  Company.find({}, function(err, companiesDB){
    if(err){
      console.log(err);
    }
      res.render("userProfile", {companies : companiesDB});
  });
});

//Kaydol
app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authebticate("local")(req, res, function(){
      res.redirect("/companies");
    });
  });
});

//Giriş Yap
app.get("/singin", function(req, res){
  res.render("singin");
});

app.post("/singin", passport.authenticate("local", {
      successRedirect : "/companies",
      failureRedirect : "/singin"
    }),
  function(req, res){
});

//Çıkış Yap
app.get("logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//MIDDLE WARE
function userLogin(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/singin");
}

//=======================
var server = app.listen(3000, function(){
  console.log("Sunucu Portu : %d", server.address().port);
})

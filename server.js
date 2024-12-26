var express = require("express");
var fileuploader = require("express-fileupload");
var mysql2 = require("mysql2");

var cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
    cloud_name: 'dlq4peclq',
    api_key: '673828536131176',
    api_secret: 'zx6DlOo-hRMGxKwiCdV3ye4p3y8' // Click 'View API Keys' above to copy your API secret
});

var app = express();
app.use(express.static("public"));

app.use(fileuploader());
app.use(express.urlencoded(true));


app.listen(2005, function () {
    console.log("Server Started");
})

let config = "mysql://avnadmin:AVNS_BGDTedcYccPkJZN9M_H@mysql-38684f1b-anjalibti10082004-479d.h.aivencloud.com:23163/myproject?";  //webserver? database?  userid? password?
let mysqlServer = mysql2.createConnection(config);
mysqlServer.connect(function (err) {
    if (err == null) {
        console.log("Connected to aiven database server Successfully");
    }
    else {
        console.log(err.message);
    }
})

app.get("/", function (req, resp) {
    let path = __dirname + "/public/index.html";
    // let path =__dirname + "/public/profileOrganizer.html";
    resp.sendFile(path);
})

app.get("/signup", function (req, resp) {
    let email = req.query.txtEmail;
    let pwd = req.query.txtPwd;
    let utype = req.query.utype;

    mysqlServer.query("insert into users(emailid,password,utype,dos,status) values(?,?,?,current_date(),?)", [email, pwd, utype, 1], function (err) {
        if (err == null) {
            resp.send("Record Saved Successfully");
        }
        else {
            resp.send(err.message);
        }
    })
})

app.get("/chk-user", function (req, resp) {
    let email = req.query.txtEmail;
    mysqlServer.query("select * from users where emailid=?", [email], function (err, jsonArray) {
        if (jsonArray.length == 1)
            resp.send("Already taken");
        else
            resp.send("Its Available...!!!!");
    })
})

app.get("/login", function (req, resp) {
    let email = req.query.logEmail;
    let pwd = req.query.logPwd;
    mysqlServer.query("select * from users where emailid=? and password=?", [email, pwd], function (err, jsonArray) {
        // resp.send(jsonArray)
        console.log(jsonArray);
        if (jsonArray.length == 1) {
            resp.send(jsonArray[0]["utype"]);
            console.log(jsonArray[0]["status"]);
        }
        else
            resp.send("incorrect");
    })

})

app.post("/signup-process-secure", async function (req, resp) {
    console.log(req.body);
    let filename = "";
    if (req.files == null) {
        filename = "nopic.jpg";
    }
    else {
        filename = req.files.profilepic.name;
        let path = __dirname + "/public/uploads/" + filename;
        console.log(path);
        req.files.profilepic.mv(path);

        await cloudinary.uploader.upload(path).then(function (result) {
            filename = result.url;
            console.log(filename);
        });
    }
    req.body.picpath = filename;

    mysqlServer.query("insert into organizers values(?,?,?,?,?,?,?,?,?,?,?,?)", [req.body.email, req.body.name, req.body.organization, req.body.num, req.body.city, req.body.address, req.body.proof, req.body.picpath, req.body.sports.toString(), req.body.prevu, req.body.exp, req.body.link], function (err) {
        if (err == null)
            resp.send("RECORD SENT SUCCESSFULLY....");
        else
            resp.send(err.message);

    })
})

app.get("/fetch-user",function(req,resp)
{
    let email=req.query.email;
    mysqlServer.query("select * from organizers where emailid=?",[email],function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
            resp.send(jsonArray);
    })

}) 

app.post("/signup-update", async function (req, resp) {
    // console.log(req.files.profilepic.name); 

    let filename = req.body.profilepic;

    filename = req.files.profilepic.name;
    let path = __dirname + "/public/uploads/" + filename;
    console.log(path);
    req.files.profilepic.mv(path); 

    await cloudinary.uploader.upload(path).then(function (result) {
        filename = result.url;
        console.log(filename);
    });

    req.body.picpath = filename;

    mysqlServer.query("update organizers set name=?,organization=?,contact=?,city=?,address=?,proof=?,ppic=?,sport=?,prev=?,exp=?,link=? where emailid=?", [req.body.name, req.body.organization, req.body.num, req.body.city, req.body.address, req.body.proof, req.body.picpath, req.body.sports, req.body.prevu, req.body.exp, req.body.link, req.body.email], function (err) {
        if (err == null)
            resp.send("Record Updated Successfully");
        else
            resp.send(err.message);

    })
})

app.post("/publish", async function (req, resp) {
    console.log(req.body);
    let filename = "";
    if (req.files == null) {
        filename = "nopic.jpg";
    }
    else {
        filename = req.files.ppic.name;
        let path = __dirname + "/public/uploads/" + filename;
        console.log(path);
        req.files.ppic.mv(path);

        await cloudinary.uploader.upload(path).then(function (result) {
            filename = result.url;
            console.log(filename);
        });
    }
    req.body.picpath = filename;

    mysqlServer.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?)", [null,req.body.email, req.body.game, req.body.title, req.body.city, req.body.loc, req.body.picpath, req.body.fee, req.body.date,req.body.prize, req.body.info], function (err) {
        if (err == null)
            resp.send("RECORD SENT SUCCESSFULLY....");
        else
            resp.send(err.message);

    })
})


app.get("/fetch-all-users",function(req,resp)
{
    let city=req.query.city;
    let game=req.query.game;
    mysqlServer.query("select * from tournaments where city=? and game=?",[city,game],function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
            resp.send(jsonArray);
    })

})

app.get("/fetch-all-cities",function(req,resp)
{
    
    mysqlServer.query("select distinct city from tournaments",function(err,jsonArrayC)
    {
        
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
       
                resp.send(jsonArrayC);
    
    })
})

app.get("/fetch-all-games",function(req,resp)
{
    
    mysqlServer.query("select distinct game from tournaments",function(err,jsonArrayG)
    {
        
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
                resp.send(jsonArrayG);
     
    })
})

app.get("/update-pwd",function(req,resp)
{
    let email=req.query.x;
    let currpwd=req.query.y;
    let newpwd=req.query.z;
    mysqlServer.query("update users set password=? where emailid=? and password=?",[newpwd,email,currpwd],function(err,result)
    {
        if(err!=null)
        {
            resp.send(err.message);
        }
        else if(result.affectedRows==1){
            resp.send("Password Updated")
        }
        else{
            resp.send("Invalid email or current password");
        }
       
    
    })
})
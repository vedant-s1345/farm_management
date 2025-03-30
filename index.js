    const express=require("express");
    const mysql=require("mysql2");
    const app=express();
    const path=require("path");
    app.set("view engine","ejs");
    app.set("views",path.join(__dirname,"/views"));
    app.use(express.urlencoded({ extended: true }));

    const connect=mysql.createConnection({
        host:"localhost",
        user:"root",
        database:"farm_management",
        password:"vedms1345"
    });

    connect.connect((err)=>{
        if(err){
            console.log("database connection failed...");
            return;
        }
        console.log("Connected to mysql database");
    })

    // app.get("/", (req, res) => {
    //     connect.query(`SELECT * FROM flogin`, (err, result) => {
    //         if (err) throw err;
    
    //         console.log(result);  // ✅ Check what data is received
    //         res.render("home", { user: result }); // ✅ Pass result as array
    //     });
    //     res.render("home");
    // });

    app.get("/", (req, res) => {
        res.render("home"); 
    });

    //farm login
    app.get("/farm_login",(req,res)=>{
        res.render("farm_login");
    })

    app.post("/farm_signup",async(req,res)=>{
        const{username,email,password}=req.body;
        let q=`insert into flogin(fusername,femail,fpassword) values(?,?,?)`;
        connect.query(q, [username, email, password], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error signing up");
            }
            let qu=`select * from flogin where femail=?`;
            connect.query(qu,[email],(err,result1)=>{
                if(err) throw err;
                if(result1.length>0) {
                    const user=result1[0];
                    res.redirect(`/farm_home/${user.fid}`);
                }
            })
            
        });
    });

    app.post("/farm_login",(req,res)=>{
        const {email,password}=req.body;
        const q="select * from flogin where femail=?";
        
        connect.query(q,[email],(err,result)=>{
            if (err) throw err;
            if (result.length > 0) {
                const user = result[0];
                if(password == user.fpassword){
                    res.redirect(`/farm_home/${user.fid}`);
                }
                else{
                    res.render("farm_login",{ message: "Invalid Username or Password..." });
                }
            } else {
                res.render("farm_login",{ message: "No such farmer found..." });
            }
        })
    
    });
    

    app.get("/farm_home/:fid",(req,res)=>{
        let {fid}=req.params;
        
        let q='select * from flogin where fid=?';
        let get_crops = `SELECT * FROM crops WHERE fid = ?`;
        connect.query(q,[fid],(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                const user=result[0];
                console.log(user);
                connect.query(get_crops,[fid],(err,result_crops)=>{
                    crops = result_crops;
                    console.log(crops);
                    res.render("farm_home",{user,crops});
                })
                
            }
        })
    })

    //trader login
    app.get("/trader_login",(req,res)=>{
        res.render("trader_login");
    })

    app.post("/trader_signup",async(req,res)=>{
        const{username,email,password}=req.body;
        let q=`insert into tlogin(tusername,temail,tpassword) values(?,?,?)`;
        connect.query(q, [username, email, password], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error signing up");
            }
            let qu=`select * from tlogin where temail=?`;
            connect.query(qu,[email],(err,result1)=>{
                if(err) throw err;
                if(result1.length>0) {
                    const user=result1[0];
                    res.redirect(`/trader_home/${user.fid}`);
                }
            })
        });
    });

    app.post("/trader_login",(req,res)=>{
        const {email,password}=req.body;
        const q="select * from tlogin where temail=?";
        
        connect.query(q,[email],(err,result)=>{
            if (err) throw err;
            if (result.length > 0) {
                const user = result[0];
                if(password == user.tpassword){
                    res.redirect(`/trader_home/${user.tid}`);
                }
                else{
                    res.render("trader_login",{ message: "Invalid Username or Password..." });
                }
            } else {
                res.render("trader_login",{ message: "No such trader found..." });
            }
        })
    
    });

    app.get("/trader_home/:tid",(req,res)=>{
        const {tid}=req.params;
        console.log(tid);
        connect.query('select distinct cname from crops',(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                crops = result;
                console.log(crops);
                connect.query('select * from tlogin where tid=?',[tid],(err,result1)=>{
                    console.log(result1);
                    user=result1[0];
                    res.render("trader_home",{user,crops});
                })
            }
        })
    })

    app.post("/trader_home/:tid/:cname",(req,res)=>{
        let{cname}=req.params;
        let{tid}=req.params;
        q='select f.fusername,c.cname,c.quantity,c.price from flogin f join crops c on f.fid=c.fid where c.cname=?';

        connect.query(q,[cname],(err,result)=>{
            if (err) throw err;
            if(result.length>0){
                data=result;
                console.log(data);
                res.render("crop_data",{data});
            }
        })
    })

    app.post("/farm_home/:fid/submitform",(req,res)=>{
        let {fid}=req.params;
        let {name,quantity,price}=req.body;
        let q='insert into crops(cname,quantity,price,fid) values(?,?,?,?)';
        connect.query(q,[name,quantity,price,fid],(err,result)=>{
            if(err){
                console.error(err);
            }
            console.log("crop added successfully...");
            res.redirect(`/farm_home/${fid}`);
        })
    })
    
   
    

    app.listen('4000',()=>{
        console.log("server is  running on port 4000....");
    });
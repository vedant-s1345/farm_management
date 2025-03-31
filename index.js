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
        let get_veges=`select  * from veges where fid=?`;
        let get_dairy=`select * from dairy where fid=?`;
        let get_poultry=`select * from poultry where fid=?`;
        connect.query(q,[fid],(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                const user=result[0];
                console.log(user);

                connect.query(get_crops,[fid],(err,result_crops)=>{
                    crops = result_crops;
                    console.log(crops);

                    connect.query(get_veges,[fid],(err,result_veges)=>{
                        veges = result_veges;
                        console.log(veges);

                        connect.query(get_dairy,[fid],(err,result_dairy)=>{
                            dairy = result_dairy;
                            console.log(dairy);

                            connect.query(get_poultry,[fid],(err,result_poultry)=>{
                                poultry = result_poultry;
                                console.log(poultry);

                                res.render("farm_home",{user,crops,veges,dairy,poultry});
                            })
                        })
                    })
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
        connect.query('select * from product_type',(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                products = result;
                console.log(products);
                connect.query('select * from tlogin where tid=?',[tid],(err,result1)=>{
                    console.log(result1);
                    user=result1[0];
                    res.render("trader_home",{user,products});
                })
            }
        })
    })

    app.post("/trader_home/:tid/:ptname",(req,res)=>{
        let{ptname}=req.params;
        let{tid}=req.params;

        if(ptname=="crops"){
            let q='SELECT DISTINCT a.cname as cropname FROM (select f.fusername,c.cname,c.quantity,c.price from flogin f join crops c on f.fid=c.fid) as a ';
            let get_crop_details = `SELECT * FROM (select f.fusername as farmer,c.cname as cropname,c.quantity as quantity,c.price as price from flogin f join crops c on f.fid=c.fid)as a `;
            connect.query(q,(err,result)=>{
                if (err) throw err;
                if(result.length>0){
                    console.log(result);
                        connect.query(get_crop_details,(err,result_specific_crop)=>{
                            if (err) throw err;
                            console.log(result_specific_crop);
                            res.render("crop_data",{result,result_specific_crop})
                        })
                        
                       
                    
                }
            })
        }

        if(ptname=="veges"){
            let q='SELECT DISTINCT a.vname as vegesname FROM (select f.fusername,v.vname,v.vquantity,v.vprice from flogin f join veges v on f.fid=v.fid) as a ';
            let get_veges_details = `SELECT * FROM (select f.fusername as farmer,v.vname as vegesname,v.vquantity as quantity,v.vprice as price from flogin f join veges v on f.fid=v.fid)as a `;
            connect.query(q,(err,result)=>{
                if (err) throw err;
                if(result.length>0){
                    console.log(result);
                        connect.query(get_veges_details,(err,result_specific_veges)=>{
                            if (err) throw err;
                            console.log(result_specific_veges);
                            res.render("veges_data",{result,result_specific_veges})
                        })

                }
            })
        }
        if(ptname=="dairy"){
            let q='SELECT DISTINCT a.dname as dairy_product FROM (select f.fusername,d.dname,d.dquantity,d.dprice from flogin f join dairy d on f.fid=d.fid) as a ';
            let get_dairy_details = `SELECT * FROM (select f.fusername as farmer,d.dname as dairy_product,d.dquantity as quantity,d.dprice as price from flogin f join dairy d on f.fid=d.fid)as a `;
            connect.query(q,(err,result)=>{
                if (err) throw err;
                if(result.length>0){
                    console.log(result);
                        connect.query(get_dairy_details,(err,result_specific_dairy)=>{
                            if (err) throw err;
                            console.log(result_specific_dairy);
                            res.render("dairy_data",{result,result_specific_dairy})
                        })

                }
            })
        }
        if(ptname=="poultry"){
            let q='SELECT DISTINCT a.pname as poultry_product FROM (select f.fusername,p.pname,p.pquantity,p.pprice from flogin f join poultry  p on f.fid=p.fid) as a ';
            let get_poultry_details = `SELECT * FROM (select f.fusername as farmer,p.pname as poultry_product,p.pquantity as quantity,p.pprice as price from flogin f join poultry p on f.fid=p.fid)as a `;
            connect.query(q,(err,result)=>{
                if (err) throw err;
                if(result.length>0){
                    console.log(result);
                        connect.query(get_poultry_details,(err,result_specific_poultry)=>{
                            if (err) throw err;
                            console.log(result_specific_poultry);
                            res.render("poultry_data",{result,result_specific_poultry})
                        })

                }
            })
        }
    })


    app.post("/farm_home/:fid/submitcrop",(req,res)=>{
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

    app.post("/farm_home/:fid/submitveges",(req,res)=>{
        let {fid}=req.params;
        let {name,quantity,price}=req.body;
        let q='insert into veges(vname,vquantity,vprice,fid) values(?,?,?,?)';
        connect.query(q,[name,quantity,price,fid],(err,result)=>{
            if(err){
                console.error(err);
            }
            console.log("vegetable added successfully...");
            res.redirect(`/farm_home/${fid}`);
        })
    })

    app.post("/farm_home/:fid/submitdairy",(req,res)=>{
        let {fid}=req.params;
        let {name,quantity,price}=req.body;
        let q='insert into dairy(dname,dquantity,dprice,fid) values(?,?,?,?)';
        connect.query(q,[name,quantity,price,fid],(err,result)=>{
            if(err){
                console.error(err);
            }
            console.log("diary product added successfully...");
            res.redirect(`/farm_home/${fid}`);
        })
    })

    app.post("/farm_home/:fid/submitpoultry",(req,res)=>{
        let {fid}=req.params;
        let {name,quantity,price}=req.body;
        let q='insert into poultry(pname,pquantity,pprice,fid) values(?,?,?,?)';
        connect.query(q,[name,quantity,price,fid],(err,result)=>{
            if(err){
                console.error(err);
            }
            console.log("poultry product added successfully...");
            res.redirect(`/farm_home/${fid}`);
        })
    })
    
   
    

    app.listen('4000',()=>{
        console.log("server is  running on port 4000....");
    });
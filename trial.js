const fs=require("fs");
const http=require("http");
const server=http.createServer((req,res)=>{
    const html=fs.readFileSync("C:/Users/vedan/OneDrive/Desktop/FARM DBMS/index.html","utf-8",(err,data)=>{
        if(err){
            res.writeHead(404,{"Content-Type":"text/plain"});
            res.end("error, file not found....")
        }
        else{
            res.writeHead(200,{"content-type":"text/html"});
            res.end(data)
        }
    });
    res.end(html);
});
server.listen(3000,()=>{
    console.log("server is running on http://localhost:3000");
});
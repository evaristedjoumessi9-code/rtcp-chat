require("dotenv").config();
const port = process.env.PORT | 8080;

const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:"*"
    }
});

io.on("connection", socket=>{
    console.log(`Nouvelle connection:\n  id: ${socket.id} \n`);
    socket.on("join-room", roomId =>{ //Ici on gere l'accession au room
        socket.join(roomId);
        console.log("Connection de l'utilisateur "+socket.id+" a la room")
    });

    socket.on("offer", data =>{ // Ici on gere la reception des offres cote serveur et leur transmissions
        socket.to(data.roomId).emit("offer",data.offer);
        console.log("offre emise")
    });

    socket.on("answer",(data)=>{ // Ici on gere la reception des reponses cote serveur et leur transmissions
        socket.to(data.roomId).emit("answer",data.answer);
        console.log("reponse envoyee")
    })

    socket.on("ice-candidate", data =>{ // Ici on gere la transmissions des ice-candidates
        socket.to(data.roomId).emit("ice-candidate", data.candidate);
        console.log("ice candidate envoyee")
    })

    socket.on("disconnect", ()=>{
        console.log("Utilisateur deconnecte");
    })
})

server.listen(port,()=>console.log(`server running at port ${port}`));
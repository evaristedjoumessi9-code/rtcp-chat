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
    socket.emit("connected",socket.id);
    socket.join(socket.id);
    socket.join("room1");
    console.log("Connection de l'utilisateur "+socket.id+" a la room")

    socket.to("room1").emit("peering",socket.id);
    console.log(socket.id+"s'appaire aux autres");

    socket.on("accept-peering",(firstID)=>{
        let idRoom = firstID+"#"+socket.id
        socket.join(firstID+"#"+socket.id);
        console.log("Creation dela room ",idRoom," et entree de l'utilisateur ",socket.id)
        socket.to(firstID).emit("remote-connecting",socket.id,idRoom);
    })
    socket.on("peering-accepted",(remoteID)=>{
        const id = socket.id+"#"+remoteID;
        socket.join(id);
        console.log(id);
        socket.emit("generate-offer",remoteID,id);
    })

    socket.on("offer", data =>{ // Ici on gere la reception des offres cote serveur et leur transmissions
        socket.to(data.roomId).emit("offer",data);
        console.log("offre emise")
    });

    socket.on("answer",(data)=>{ // Ici on gere la reception des reponses cote serveur et leur transmissions
        socket.to(data.roomId).emit("answer",data);
        console.log("reponse envoyee")
    })

    socket.on("ice-candidate", data =>{ // Ici on gere la transmissions des ice-candidates
        socket.to(data.roomId).emit("ice-candidate", data);
        console.log("ice candidate envoyee")
    })

    socket.on("disconnect", ()=>{
        console.log("Utilisateur deconnecte");
    })
})

server.listen(port,()=>console.log(`server running at port ${port}`));
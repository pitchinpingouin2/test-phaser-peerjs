const socket = io('/')
const myPeer = new Peer(undefined, {
    host: "/",
    port: "8002",
})

// Communication variables

const OP_ID = 10;
const OP_MSG = 12;
const OP_POSITION = 20;
const OP_PWRUP = 30;

const eventPWRup = new Event("eventPWRup");

var connections = [];
var positions = [{peer: "", x:0, y:0}, {peer: "", x:0, y:0}, {peer: "", x:0, y:0}, {peer: "", x:0, y:0}, {peer: "", x:0, y:0}];
var powerUpPosition = {x: 100, y:100}


// HTML elements

var chat = document.getElementById("chat");
var message = document.getElementById("yourMessage");
var sendButton = document.getElementById("sendButton").addEventListener("click", () => {
    if(message.value) {
        addTextToChat("You: " + message.value)
        sendMessage(message.value)
        message.value = "";
    }
})


myPeer.on('open', (userId) =>{
    socket.emit('join-room', ROOM_ID, userId);
    positions[0].peer = userId;
} )

myPeer.on('connection', function(conn) {

    // print text when we receive some
    conn.on('data', function(data){
        if(data.op===OP_MSG){
            addTextToChat(data.msg);
        }
        else if (data.op===OP_ID){
            // Connect back to that user + setup a player spot if available
            addConnection(data.id);
            assignPlayer(data.id);
        }
        else if(data.op===OP_POSITION){
            for(let i = 0; i < positions.length; i++){
                if(positions[i].peer===conn.peer)
                {
                    positions[i].x = data.x;
                    positions[i].y = data.y;
                    break;
                }
            } 
        }

        else if(data.op===OP_PWRUP){
            newPositionEventPWRup(data.x, data.y);
        }
    });
});

///Server communication

socket.on("num-clients", (numClients) => {
    updateConnectedCount(numClients);
});

socket.on("user-connected", (userId, numClients) => {
    updateConnectedCount(numClients);
    addTextToChat(`/ User ${userId} arrived ! /`);
    sayHiToNewUser(userId);
    assignPlayer(userId);
    
    
});

socket.on('user-left', (userId, numClients) =>{
    updateConnectedCount(numClients);
    addTextToChat("// User " + userId + " left //");
    removeConnection(userId);
})

// Methods

function addConnection(userId){
    var conn = myPeer.connect(userId);
    connections.push(conn);
    
    return conn;
}

function assignPlayer(userId){
    for(var i=0; i < positions.length; i++){
        //DEBUG CHECK.
        if(positions[i].peer===userId){
            break;
        }
        //
        if(positions[i].peer===""){
            positions[i].peer=userId;

            dispatchEvent( new CustomEvent("eventNewPlayer", { 
                detail: {
                    playerId: i+1
                }
            }
        ));
            break;
        }
    }
}

function removeConnection(userId){
    for(var i=0; i < positions.length; i++){
        if(i<connections.length && connections[i].peer===userId){
            connections.splice(i, 1);
        }
        if(positions[i].peer===userId){
            positions[i].peer = "";
            dispatchEvent( new CustomEvent("eventPlayerLeft", { 
                detail: {
                    playerId: i+1
                }
            }) );
        }
    }
}

function sayHiToNewUser(userId){
    var conn = addConnection(userId);
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
    // send initial "Hi" message
    conn.send({op: OP_ID, id: myPeer.id})
    conn.send({op: OP_MSG, msg: `hi from ${myPeer.id}!`});
    
    conn.on("close", () => {
        console.log("client saw the leave");
    })
});
}

function addTextToChat(text){
    chat.textContent += text + "\n" ;
}

function updateConnectedCount(count){
    document.getElementById("numconnected").firstChild.nodeValue = "Number of connected: " + count;
}

function sendMessage(messageToSend){
    for(let i=0; i < connections.length; i++){
        connections[i].send({op: OP_MSG, msg: messageToSend});
    }
}

function sendMyPosition(posX, posY){
    for(let i=0; i < connections.length; i++){
        connections[i].send({op: OP_POSITION, x: posX, y: posY});
    }
}

function sendPowerUpNewPosition(posX, posY){
    for(let i=0; i < connections.length; i++){
        connections[i].send({op: OP_PWRUP, x: posX, y: posY});
    }
    // do something for ourself too
    newPositionEventPWRup(posX, posY);
}

function newPositionEventPWRup(posX, posY){
    powerUpPosition.x = posX;
    powerUpPosition.y = posY;
    dispatchEvent(eventPWRup);
}
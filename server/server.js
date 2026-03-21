// добавим хранение чатов
let chats = [
  {id:1, name:"Общий чат", users:[], messages:[]},
  {id:2, name:"Анна", users:[], messages:[]},
  {id:3, name:"Дмитрий", users:[], messages:[]}
];

wss.on("connection", (ws) => {

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if(data.type==="join"){
      ws.username = data.username;
      ws.currentChat = 1; // по умолчанию общий чат
      sendChatList(ws);
      sendChatMessages(ws, ws.currentChat);
      broadcast({
        type:"system",
        text:`${data.username} подключился`
      });
    }

    if(data.type==="switch"){
      ws.currentChat = data.chatId;
      sendChatMessages(ws, ws.currentChat);
    }

    if(data.type==="message"){
      const chat = chats.find(c=>c.id===ws.currentChat);
      const msgObj = {
        user: ws.username,
        text: data.text,
        time: new Date().toLocaleTimeString()
      };
      chat.messages.push(msgObj);
      broadcast({
        type:"message",
        chatId: chat.id,
        ...msgObj
      });
    }
  });

});

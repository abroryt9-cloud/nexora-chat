let ws;
let username = "";

function start(){
  username = document.getElementById("username").value.trim();
  if(!username) return alert("Введите имя");

  ws = new WebSocket("ws://" + location.host);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type:"join",
      username
    }));
  };

  ws.onmessage = (event)=>{
    const data = JSON.parse(event.data);
    handleMessage(data);
  };

  document.getElementById("login").classList.remove("active");
  document.getElementById("app").classList.add("active");
}

/* send message */
function send(){
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if(!text) return;

  ws.send(JSON.stringify({
    type:"message",
    text
  }));

  input.value="";
}

/* render */
function handleMessage(data){
  const box = document.getElementById("messages");

  const div = document.createElement("div");

  if(data.type === "system"){
    div.innerText = data.text;
    div.style.textAlign = "center";
    div.style.color = "#888";
  }

  if(data.type === "message"){
    div.className = "msg " + (data.user === username ? "me":"other");
    div.innerHTML = `
      <div>${data.user}: ${data.text}</div>
      <div class="time">${data.time}</div>
    `;
  }

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

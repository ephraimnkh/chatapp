import { Component } from "@angular/core";
import * as io from "socket.io-client";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  messenger: string;
  messageText: string;
  messages: Array<any> = [];
  socket: SocketIOClient.Socket;
  constructor() {
    this.socket = io.connect();
  }
  ngOnInit() {
    this.messages = new Array();
    this.listen2Events();
  }
  listen2Events() {
    this.socket.on("msg", data => {
      this.messages.push(data);
    });
    this.socket.on("reloadAudio", fileName => {
          document.getElementById('audio').outerHTML = ' <audio id="audio" controls><source src = "" type = "audio/mpeg" id = "sound"></audio>'
          document.getElementById('sound').outerHTML = '<source src="" type = "audio/mpeg" id = "sound" >';
          var sourceSound = document.getElementById('sound');
          console.log("value of src = " + sourceSound.getAttribute('src'));
          sourceSound.setAttribute('src', "assets/" + fileName);
          console.log("value of src = " + sourceSound.getAttribute('src'));
          var audio = document.getElementById('audio');
          var newAudio = audio.outerHTML;
          audio.outerHTML = newAudio;
    });
    this.socket.on("alertUser", data => {
      alert(data);
    });
  }
  sendMessage() {
    this.socket.emit("newMsg", [this.messenger, this.messageText, this.socket.id]);
    this.messageText = "";
  }
  convertMessage(){
    if (this.messages.length == 0){
      alert("no messages to convert sorry"); 
      return;
    }
    if (this.messages[this.messages.length - 1].id == this.socket.id)
      this.socket.emit("convertMsg", this.messages[this.messages.length - 1].msg);
    else {
        for (let i = this.messages.length - 1; i >= 0; i--){
          if (this.messages[i].id == this.socket.id || this.messages[i].messenger == this.messenger) {
            this.socket.emit("convertMsg", this.messages[i].msg);
            console.log("matched");
            i = -1;
          }
        }
    }
  }
}
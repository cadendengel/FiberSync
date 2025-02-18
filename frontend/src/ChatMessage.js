import { v4 as uuidv4 } from 'uuid';

class ChatMessage {
  constructor(user = "You", text) { 
    if (!text || !text.trim()) {
      this.empty = true;
    }

    this.type = "message";
    this.messageid = uuidv4();
    this.timestamp = new Date().toISOString();
    this.user = user;
    this.text = text;
  }
}

export default ChatMessage;
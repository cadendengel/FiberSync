import { v4 as uuidv4 } from 'uuid';

class ChatMessage {
  constructor(user, text) { 
    if (!text || !text.trim()) {
      this.empty = true;
    }

    this.messageid = uuidv4(); // generates unique id
    this.timestamp = new Date().toISOString(); // generates timestamp
    this.user = user; // user id. For now this is just the username.
    this.text = text; // message content
  }
}

export default ChatMessage;
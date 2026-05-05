export interface ChatMessageInterface {
  _id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessageInterface[];
  hasMore: boolean;
}

export interface SendMessageResponse {
  userMsg: ChatMessageInterface;
  aiMsg: ChatMessageInterface;
}

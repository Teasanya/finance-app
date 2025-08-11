import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';

export interface FinancialRecordObject {
  date: string;
  salary: number;
  shops: number;
  restaurants: number;
  travel: number;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  userId?: string;
}

export const useSocketIO = () => {
  const socket = ref<Socket | null>(null);
  const socketId = ref<string | null>(null);
  const isConnected = ref(false);
  const error = ref<string | null>(null);
  const receivedTableData = ref<FinancialRecordObject[]>([]);
  const receivedMessages = ref<ChatMessage[]>([]);

  const connect = (
    url: string,
    callbacks?: {
      onTableUpdate?: (data: FinancialRecordObject[]) => void;
      onChatMessages?: (messages: ChatMessage[]) => void;
      onInitData?: (data: {
        table: FinancialRecordObject[];
        messages: ChatMessage[];
      }) => void;
    }
  ) => {
    socket.value = io(url);

    socket.value.on('connect', () => {
      isConnected.value = true;
      socketId.value = socket.value?.id || null;
      console.log('Socket.IO connected');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('Socket.IO disconnected');
    });

    socket.value.on('connect_error', (err) => {
      error.value = 'Socket.IO error';
      console.error('Socket.IO error:', err);
    });

    socket.value.on('table_update', (payload: FinancialRecordObject[]) => {
      receivedTableData.value = payload;
      callbacks?.onTableUpdate?.(payload);
    });

    // socket.value.on('chat_message', (payload: ChatMessage) => {
    //   receivedMessages.value.push({
    //     text: payload.text,
    //     sender: 'other',
    //     timestamp: new Date(payload.timestamp),
    //   });
    // });

    socket.value.on('new_message', (payload: ChatMessage) => {
      const isOwn = payload.userId === socketId.value;

      const newMsg = {
        text: payload.text,
        sender: isOwn ? 'user' : 'other',
        timestamp: new Date(payload.timestamp),
      } as ChatMessage;

      receivedMessages.value.push(newMsg);

      if (callbacks?.onChatMessages) {
        callbacks.onChatMessages([...receivedMessages.value]);
      }
    });

    socket.value.on(
      'init_data',
      (data: { table: FinancialRecordObject[]; messages: ChatMessage[] }) => {
        receivedTableData.value = data.table;
        receivedMessages.value = data.messages.map((msg) => ({
          ...msg,
          sender: msg.userId === socketId.value ? 'user' : 'other',
          timestamp: new Date(msg.timestamp),
        }));
        callbacks?.onInitData?.({
          table: data.table,
          messages: receivedMessages.value,
        });
      }
    );
  };

  const sendTableData = (data: FinancialRecordObject[]) => {
    if (socket.value && isConnected.value) {
      socket.value.emit('table_update', data);
    } else {
      console.error('Socket.IO is not connected');
    }
  };

  const sendChatMessage = (msg: ChatMessage) => {
    if (!socket.value || !isConnected.value) return;

    socket.value.emit('chat_message', { text: msg.text });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
    }
  };

  return {
    connect,
    sendTableData,
    sendChatMessage,
    disconnect,
    isConnected,
    error,
    receivedTableData,
    receivedMessages,
  };
};

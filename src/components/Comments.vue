<template>
  <div class="comments">
    <h2>Комментарии</h2>
    <div class="chat-container">
      <div class="chat-messages">
        <div
          v-for="(message, index) in props.messages"
          :key="index"
          :class="[
            'message',
            message.sender === 'user' ? 'user-message' : 'other-message',
          ]"
        >
          {{ message.text }}
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
      <div class="chat-input">
        <input
          v-model="inputValue"
          @keyup.enter="send"
          placeholder="Введите сообщение..."
          class="message-input"
        />
        <button @click="$emit('send-message', inputValue)" class="send-button">
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { type PropType } from 'vue';
import { type ChatMessage } from '../services/websocket.service';
import { formatTime } from '../utils/formatTime';

const props = defineProps({
  messages: {
    type: Array as PropType<ChatMessage[]>,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'send-message']);

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const send = () => {
  if (inputValue.value.trim()) {
    emit('send-message', inputValue.value);
    inputValue.value = '';
  }
};
</script>
<style scoped>
.comments {
  padding: 20px;
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 15px;
  /* background: var(--secondary-bg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  width: 100%;
}
.chat-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--chat-bg);
  border-radius: 8px;
  margin-bottom: 10px;
}

.message {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.user-message {
  align-self: flex-end;
  background-color: #4e73df;
  color: white;
  border-bottom-right-radius: 4px;
}

.other-message {
  align-self: flex-start;
  background-color: #f8b3d6;
  color: black;
  border-bottom-left-radius: 4px;
}

.message-time {
  display: block;
  font-size: 0.7em;
  opacity: 0.8;
  margin-top: 4px;
  text-align: right;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.send-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: rgb(95, 95, 233);
}
</style>

<template>
  <AppHeader />
  <div class="content">
    <div class="main">
      <div class="financial-tracker">
        <h2>Учет финансов</h2>
        <div class="connection-status">
          Статус подключения:
          <span :class="isConnected ? 'connected' : 'disconnected'">
            {{ isConnected ? 'Подключено' : 'Отключено' }}
          </span>
          <span v-if="error" class="error">({{ error }})</span>
        </div>

        <HotTable
          ref="hotTable"
          :settings="hotSettings"
          :data="tableData"
          class="custom-hot-table"
        />

        <div class="add-record-form">
          <input
            v-model.number="newRecord.amount"
            type="number"
            placeholder="Сумма"
            class="form-input"
          />
          <select v-model="newRecord.category" class="form-select">
            <option value="shops">Магазины</option>
            <option value="restaurants">Рестораны</option>
            <option value="travel">Путешествия</option>
            <option value="salary">Зарплата</option>
          </select>
          <input v-model="newRecord.date" type="date" class="form-input" />
          <button @click="addRecord" class="form-button">Добавить</button>
        </div>
      </div>
      <div class="financial-summary">
        <doughnut-chart
          :value1="travelTotal"
          :value2="shopsTotal"
          :value3="restaurantsTotal"
          color1="#4e73df"
          color2="#1cc88a"
          color3="#36b9cc"
          title="Распределение расходов"
        ></doughnut-chart>
      </div>
    </div>
    <Comments
      v-model="newMessage"
      @send-message="sendMessage"
      :messages="messages"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { type Ref } from 'vue';
import { HotTable } from '@handsontable/vue3';
import { registerAllModules } from 'handsontable/registry';
import { type CellRendererFunction } from 'handsontable';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import AppHeader from './components/AppHeader.vue';
import { useThemeStore } from './stores/themeStore';
import { useSocketIO } from './services/websocket.service';
import Comments from './components/Comments.vue';
import { type FinancialRecordObject } from './services/websocket.service';
import { type ChatMessage } from './services/websocket.service';
import DoughnutChart from './components/DoughnutChart.vue';

type FinancialRecord = FinancialRecordArray;

type RecordCategory = 'salary' | 'shops' | 'restaurants' | 'travel';

interface NewRecord {
  amount: number | null;
  category: RecordCategory;
  date: string;
}
type FinancialRecordArray = [string, number, number, number, number];

const {
  connect,
  sendTableData,
  sendChatMessage,
  isConnected,
  disconnect,
  error,
  receivedTableData,
  receivedMessages,
} = useSocketIO();

const messages = receivedMessages;
const tableData: Ref<FinancialRecord[]> = ref([]);

interface NewRecord {
  amount: number | null;
  category: RecordCategory;
  date: string;
}

interface InitData {
  table: FinancialRecordObject[];
  messages: ChatMessage[];
}

const newMessage = ref('');

const sendMessage = (text: string) => {
  if (!text?.trim()) return;

  const newMsg: ChatMessage = {
    text,
    sender: 'user',
    timestamp: new Date(),
  };

  sendChatMessage(newMsg);

  newMessage.value = '';
};

registerAllModules();

const themeStore = useThemeStore();
const hotTable = ref<{ hotInstance: Handsontable } | null>(null);

const dateFormatier = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const newRecord: Ref<NewRecord> = ref({
  amount: null,
  category: 'shops',
  date: new Date().toISOString().slice(0, 10),
});

const hotSettings = ref({
  data: tableData.value,
  colHeaders: ['Дата', 'Зарплата', 'Магазины', 'Рестораны', 'Путешествия'],
  columns: [
    {
      type: 'text',
      renderer: ((instance, td, row, col, prop, value) => {
        if (value) {
          const date = new Date(value);
          td.textContent = dateFormatier.format(date);
        }
        return td;
      }) as CellRendererFunction,
    },
    { type: 'numeric', format: '0,0' },
    { type: 'numeric', format: '0,0' },
    { type: 'numeric', format: '0,0' },
    { type: 'numeric', format: '0,0' },
  ],
  rowHeaders: true,
  width: 800,
  height: 'auto',
  licenseKey: 'non-commercial-and-evaluation',
  className: 'custom-table',
  stretchH: 'all',
});

const salaryTotal = computed<number>(() =>
  tableData.value.reduce((sum, row) => sum + (row[1] ?? 0), 0)
);

const shopsTotal = computed<number>(() =>
  tableData.value.reduce((sum, row) => sum + (row[2] ?? 0), 0)
);

const restaurantsTotal = computed<number>(() =>
  tableData.value.reduce((sum, row) => sum + (row[3] ?? 0), 0)
);

const travelTotal = computed<number>(() =>
  tableData.value.reduce((sum, row) => sum + (row[4] ?? 0), 0)
);

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
};

const addRecord = (): void => {
  if (!newRecord.value.amount || !newRecord.value.date) {
    alert('Заполните все поля!');
    return;
  }

  const amount: number = Number(newRecord.value.amount);
  const date: string = newRecord.value.date;
  const category: RecordCategory = newRecord.value.category;

  const existingIndex: number = tableData.value.findIndex(
    (row: FinancialRecordArray) => row[0] === date
  );

  if (existingIndex >= 0) {
    const row = tableData.value[existingIndex];
    switch (category) {
      case 'salary':
        row[1] += amount;
        break;
      case 'shops':
        row[2] += amount;
        break;
      case 'restaurants':
        row[3] += amount;
        break;
      case 'travel':
        row[4] += amount;
        break;
    }
  } else {
    const newRow: FinancialRecord = [
      date,
      category === 'salary' ? amount : 0,
      category === 'shops' ? amount : 0,
      category === 'restaurants' ? amount : 0,
      category === 'travel' ? amount : 0,
    ];

    tableData.value.push(newRow);
  }

  tableData.value.sort(
    (a: FinancialRecordArray, b: FinancialRecordArray) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  if (hotTable.value?.hotInstance) {
    hotTable.value.hotInstance.loadData(tableData.value);
  }

  const filteredData = tableData.value.filter((row) => row[0] !== '');
  sendTableData(
    filteredData.map((row) => ({
      date: row[0],
      salary: row[1],
      shops: row[2],
      restaurants: row[3],
      travel: row[4],
    }))
  );

  newRecord.value = {
    amount: null,
    category: 'shops',
    date: new Date().toISOString().slice(0, 10),
  };
};

onMounted(() => {
  themeStore.initializeTheme();
  connect('http://localhost:3000', {
    onTableUpdate: (data: FinancialRecordObject[]) => {
      tableData.value = data.map((item: FinancialRecordObject) => [
        item.date,
        item.salary || 0,
        item.shops || 0,
        item.restaurants || 0,
        item.travel || 0,
      ]);
      if (hotTable.value?.hotInstance) {
        hotTable.value.hotInstance.loadData(tableData.value);
      }
    },
    onChatMessages: (data: ChatMessage[]) => {
      console.log('chat', data);
      messages.value = data;
    },
    onInitData: (data: InitData) => {
      tableData.value = data.table.map((item: FinancialRecordObject) => [
        item.date,
        item.salary || 0,
        item.shops || 0,
        item.restaurants || 0,
        item.travel || 0,
      ]);
      console.log(data.messages);
      messages.value = data.messages;
      console.log('init', messages.value);
    },
  });
});
onBeforeUnmount(() => {
  disconnect();
});
</script>

<style scoped>
.main {
  display: flex;
  gap: 20px;
  max-width: 100%;
}

h2 {
  color: rgb(56, 56, 172);
}
.financial-tracker {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 15px;
  background: var(--secondary-bg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.connection-status {
  margin-bottom: 15px;
  font-size: 14px;
}

.connected {
  color: #1cc88a;
  font-weight: bold;
}

.disconnected {
  color: #e74a3b;
  font-weight: bold;
}

.error {
  color: #e74a3b;
}

.financial-summary {
  width: 30%;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 15px;
  background: var(--secondary-bg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-item {
  font-size: 18px;
  font-weight: bold;
}

.add-record-form {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-button:hover {
  background-color: rgb(95, 95, 233);
}

:deep(.handsontable) {
  font-family: 'Arial', sans-serif;
}

:deep(.handsontable thead th) {
  background-color: rgb(56, 56, 172);
  color: white;
  font-weight: 600;
  text-align: center;
}

:deep(.custom-table td) {
  border: 1px solid #eee;
  padding: 8px;
}

:deep(.custom-table .htNumeric) {
  text-align: right;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 2rem;
}
</style>

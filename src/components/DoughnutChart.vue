<template>
  <div class="doughnut-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default {
  name: 'DoughnutChart',
  props: {
    value1: {
      type: Number,
      required: true,
    },
    value2: {
      type: Number,
      required: true,
    },
    value3: {
      type: Number,
      required: true,
    },

    color1: {
      type: String,
      default: '#4e73df',
    },
    color2: {
      type: String,
      default: '#1cc88a',
    },
    color3: {
      type: String,
      default: 'rgb(166, 94, 233)',
    },

    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const createChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      if (chartCanvas.value) {
        const ctx = chartCanvas.value.getContext('2d');

        chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Путешествия', 'Магазины', 'Рестораны'],
            datasets: [
              {
                data: [props.value1, props.value2, props.value3],
                backgroundColor: [props.color1, props.color2, props.color3],
                hoverBackgroundColor: [
                  props.color1,
                  props.color2,
                  props.color3,
                ],
                hoverBorderColor: 'rgba(234, 236, 244, 1)',
                borderWidth: 2,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,

            plugins: {
              title: {
                display: !!props.title,
                text: props.title,
                font: {
                  size: 16,
                },
              },
              tooltip: {
                backgroundColor: 'rgb(255,255,255)',
                bodyColor: '#858796',
                borderColor: '#dddfeb',
                borderWidth: 1,
                displayColors: true,
                caretPadding: 10,
                callbacks: {
                  label: function (context) {
                    const total = context.dataset.data.reduce(
                      (acc, val) => acc + val,
                      0
                    );
                    const currentValue = context.raw;
                    const percentage = Math.round((currentValue / total) * 100);
                    return `${context.label}: ${currentValue} (${percentage}%)`;
                  },
                },
              },
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
            },
            cutout: '40%',
          },
        });
      }
    };

    onMounted(createChart);

    watch(
      () => [
        props.value1,
        props.value2,
        props.value3,
        props.color1,
        props.color2,
        props.color3,
        props.title,
      ],
      () => {
        createChart();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      chartCanvas,
    };
  },
};
</script>

<style scoped>
.doughnut-chart-container {
  position: relative;
  height: 100%;
  min-height: 300px;
  width: 100%;
}
</style>

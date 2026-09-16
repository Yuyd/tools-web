<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div class="tool-content">
        <div class="input-section">
          <el-form label-position="top">
            <el-form-item label="转盘选项（每行一个）">
              <el-input
                v-model="optionsText"
                type="textarea"
                :rows="6"
                placeholder="请输入转盘选项，每行一个"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateWheel">更新转盘</el-button>
              <el-button @click="clearOptions">清空</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="wheel-section">
          <div class="wheel-wrapper">
            <div 
              class="wheel"
              :style="wheelStyle"
            >
              <div
                v-for="(option, index) in options"
                :key="`${index}-${option}`"
                class="wheel-label-wrap"
                :style="{ transform: `rotate(${getLabelDeg(index)}deg)` }"
              >
                <span
                  class="wheel-label-text"
                  :class="{ 'is-radial': isCrowded }"
                  :style="getLabelTextStyle(index)"
                  :title="option"
                >
                  {{ displayOption(option) }}
                </span>
              </div>
              <div class="wheel-center"></div>
            </div>
            <div class="wheel-pointer"></div>
          </div>
          
          <div class="wheel-controls">
            <el-button 
              type="primary" 
              :disabled="isSpinning || options.length < 2"
              @click="spinWheel"
            >
              {{ isSpinning ? '旋转中...' : '开始旋转' }}
            </el-button>
            <div v-if="result" class="result">
              结果: {{ result }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线转盘工具，自定义选项后旋转转盘随机选择结果，支持多个选项和动画效果，可用于随机选择、抽奖等场景。
      </el-text>
    </ToolDetail>

      <!-- 底部广告 -->
    <div class="home-ad mt-8">
      <div id="container-fbcb838137ee667edfeeabc0229c433c"></div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

import { loadNativeAd, unloadNativeAd } from '@/utils/nativeAd'
const adScriptId = 'profitablerate-Wheel-ad-script'
const title = "转盘工具"

const optionsText = ref('');
const options = ref<string[]>([]);
const isSpinning = ref(false);
const result = ref<string>('');
const rotation = ref(0);

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
];

const parseOptions = () => {
  options.value = optionsText.value
    .split('\n')
    .map(option => option.trim())
    .filter(option => option !== '');
};

const updateWheel = () => {
  parseOptions();
  result.value = '';
  rotation.value = 0;
};

const clearOptions = () => {
  optionsText.value = '';
  options.value = [];
  result.value = '';
  rotation.value = 0;
};

const conicGradient = computed(() => {
  const count = options.value.length;
  if (count === 0) {
    return '#e5e7eb';
  }
  const angle = 360 / count;
  const stops = options.value.map((_, index) => {
    const color = colors[index % colors.length];
    const start = index * angle;
    const end = (index + 1) * angle;
    return `${color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
});

const wheelStyle = computed(() => {
  return {
    transform: `rotate(${rotation.value}deg)`,
    background: conicGradient.value,
  };
});

const getLabelDeg = (index: number) => {
  const count = options.value.length;
  if (count === 0) return 0;
  const slice = 360 / count;
  return index * slice + slice / 2;
};

const isCrowded = computed(() => options.value.length > 8);

const displayOption = (option: string) => {
  const count = options.value.length;
  const maxChars = count > 20 ? 3 : count > 12 ? 4 : count > 8 ? 6 : 10;
  if (option.length <= maxChars) return option;
  return `${option.slice(0, maxChars)}…`;
};

const getLabelTextStyle = (index: number) => {
  const count = options.value.length;
  if (count === 0) return {};
  if (!isCrowded.value) {
    return {
      transform: `translateX(-50%) rotate(${-getLabelDeg(index)}deg)`,
      fontSize: count <= 5 ? '16px' : '14px',
      top: '20%',
      maxWidth: '72px',
    };
  }
  const fontSize = Math.max(10, Math.min(13, Math.round(220 / count)));
  return {
    transform: 'translate(-50%, -50%) rotate(90deg)',
    fontSize: `${fontSize}px`,
    top: '22%',
    maxWidth: count > 18 ? '70px' : '88px',
  };
};

const spinWheel = () => {
  if (isSpinning.value || options.value.length < 2) {
    return;
  }

  isSpinning.value = true;
  result.value = '';

  const randomRotation = 360 * (3 + Math.random() * 2);
  const startRotation = rotation.value;
  const finalRotation = startRotation + randomRotation;
  const anglePerOption = 360 / options.value.length;
  const selectedIndex = Math.floor(((360 - (finalRotation % 360)) % 360) / anglePerOption) % options.value.length;
  const duration = 3000 + Math.random() * 2000;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    rotation.value = startRotation + randomRotation * easeOut;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation.value = finalRotation;
      isSpinning.value = false;
      result.value = options.value[selectedIndex];
    }
  };

  requestAnimationFrame(animate);
};

optionsText.value = '选项1\n选项2\n选项3\n选项4\n选项5';
parseOptions();

onMounted(() => {
  loadNativeAd(adScriptId)
})

onUnmounted(() => {
  unloadNativeAd(adScriptId)
})
</script>

<style scoped>
.tool-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section {
  width: 100%;
}

.wheel-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wheel-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 20px;
}

.wheel {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.wheel-label-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wheel-label-text {
  position: absolute;
  left: 50%;
  top: 20%;
  max-width: 72px;
  color: white;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wheel-label-text.is-radial {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.wheel-pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 24px solid #ff6b6b;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  z-index: 20;
}

.wheel-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.result {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .tool-content {
    flex-direction: row;
  }
  
  .input-section {
    width: 40%;
  }
  
  .wheel-section {
    width: 60%;
  }
}
</style>
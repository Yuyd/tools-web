<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

import { loadNativeAd, unloadNativeAd } from '@/utils/nativeAd'
const adScriptId = 'profitablerate-TextRemoveDuplicate-ad-script'
const info = reactive({
  title: "文本去重",
  content: '',
  tranRes: '',
})


//clear
const clear = () => {
  info.content = ''
}


const removeDuplicate = computed(() => {
  let tmpArr = info.content.split('\n')
  let resultSet = new Set(tmpArr)
  let fromResArr = Array.from(resultSet)
  info.tranRes = fromResArr.join("\n")
  return info.tranRes 
})

//copy
const copyRes = async () => {
  copy(info.tranRes)
}

onMounted(() => {
  loadNativeAd(adScriptId)
})

onUnmounted(() => {
  unloadNativeAd(adScriptId)
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-input type="textarea" :rows="8" v-model="info.content"></el-input>
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="copyRes">复制结果</el-button>
        <el-button type="danger" @click="clear">清空内容</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-input type="textarea" :rows="8" v-model="removeDuplicate"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        可以删除或去除文本或字符串中的重复行
      </el-text> 
    </ToolDetail>

      <!-- 底部广告 -->
    <div class="home-ad mt-8">
      <div id="container-fbcb838137ee667edfeeabc0229c433c"></div>
    </div>
</div>
</template>

<style scoped>
</style>
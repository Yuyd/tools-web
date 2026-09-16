<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { loadNativeAd, unloadNativeAd } from '@/utils/nativeAd'
// import { copy } from '@/utils/string'
const adScriptId = 'profitablerate-Example-ad-script'
const info = reactive({
  title: "tool name",
})

//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }

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
      
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        示例...
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
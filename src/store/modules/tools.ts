//创建tools相关的小工具
import { defineStore } from 'pinia'
import { getTools, getToolsCate } from '@/components/Tools/tools.ts'
import { getIp } from '@/api/ip'
import type { ToolsReqData, ToolsInfo } from '@/components/Tools/tools.type.ts'
import type { IpReqData, IpInfo } from '@/api/ip/type'
import type { WebInfo, WebInfoReqData } from '@/api/webinfo/type'
import { fetchWebInfo } from '@/api/webinfo'

// 收藏工具列表存储键名
const COLLECTED_TOOLS_KEY = 'collected_tools';

export const useToolsStore = defineStore('tools', {
  //用来存放变量
  state: () => ({
    list: [] as ToolsInfo[],
    currentTool: {} as ToolsInfo,
    cates: [] as any[],
    recommends: [] as ToolsInfo[],
    ipData: {} as IpInfo,
    webInfo: {} as WebInfo,
    collectedTools: [] as ToolsInfo[],
  }),
  //方法
  actions: {
    //获取tools
    async getTools(data: ToolsReqData) {
      //发送请求
      const result: any = await getTools(data)
      this.list = result
      return result
    },
    //获取tool info
    async getToolInfo(data: ToolsReqData) {
      //发送请求
      const result: any = await getTools(data)
      this.currentTool = result[0] || {}
      return result
    },
    //获取tools cate
    async getToolCate() {
      //发送请求
      this.cates = await getToolsCate()
    },
    //获取ip
    async getIp(data: IpReqData) {
      const result: any = await getIp(data)
      if (result.code == 200) {
        this.ipData = result.data
        return result.message
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
    //获取网站信息
    async getWebInfo(data: WebInfoReqData) {
      const result: any = await fetchWebInfo(data)
      if (result.code == 200) {
        this.webInfo = result.data
        return result.message
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
    // 加载收藏工具
    loadCollectedTools() {
      try {
        const stored = localStorage.getItem(COLLECTED_TOOLS_KEY);
        if (stored) {
          this.collectedTools = JSON.parse(stored);
        }
      } catch (error) {
        console.error('加载收藏工具失败:', error);
        this.collectedTools = [];
      }
    },
    // 保存收藏工具到本地存储
    saveCollectedTools() {
      try {
        localStorage.setItem(COLLECTED_TOOLS_KEY, JSON.stringify(this.collectedTools));
      } catch (error) {
        console.error('保存收藏工具失败:', error);
      }
    },
    // 添加收藏
    addCollect(tool: ToolsInfo) {
      // 检查是否已经收藏
      const isCollected = this.collectedTools.some(t => t.url === tool.url);
      if (!isCollected) {
        this.collectedTools.push(tool);
        this.saveCollectedTools();
        return true;
      }
      return false;
    },
    // 移除收藏
    removeCollect(url: string) {
      const index = this.collectedTools.findIndex(tool => tool.url === url);
      if (index > -1) {
        this.collectedTools.splice(index, 1);
        this.saveCollectedTools();
        return true;
      }
      return false;
    },
    // 检查是否已收藏
    isCollected(url: string) {
      const normalizedUrl = url.replace(/\/$/, '');
      return this.collectedTools.some(tool => {
        const toolUrl = tool.url.replace(/\/$/, '');
        return toolUrl === normalizedUrl;
      });
    },
  }
})
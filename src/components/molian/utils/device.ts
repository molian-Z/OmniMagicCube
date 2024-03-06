import { useStorage } from '@vueuse/core'

export const deviceList = useStorage('deviceList', [{
  name: "PC(720P)",
  width: 1280,
  height: 720,
  device: "PC(720P)",
  deviceType: "PC",
  resolutionRatio: "720P",
}, {
  name: "PC(1080P)",
  width: 1920,
  height: 1080,
  device: "PC(1080P)",
  deviceType: "PC",
  resolutionRatio: "1080P",
}, {
  name: "PC(1440P)",
  width: 2560,
  height: 1440,
  device: "PC(1440P)",
  deviceType: "PC",
  resolutionRatio: "1440P",
}, {
  name: "PC(3.1K)",
  width: 3120,
  height: 2080,
  device: "PC(3.1K)",
  deviceType: "PC",
  resolutionRatio: "3.1K",
}, {
  name: "PC(4K)",
  width: 4096,
  height: 2160,
  device: "PC(4K)",
  deviceType: "PC",
  resolutionRatio: "4K",
}, {
  name: "Phone(750P)",
  width: 750,
  height: 1334,
  device: "Phone(750P)",
  deviceType: "Phone",
  resolutionRatio: "750P",
  coverBackground: []
}, {
  name: "iPhone15",
  width: 1179,
  height: 2556,
  device: "iPhone15",
  deviceType: "Phone",
  resolutionRatio: "iPhone15",
  coverBackground: [{
      left: 100,
      width: 979,
      top: 0,
      height: 140,
      borderRadius: [0, 0, 50, 50]
  }]
}, {
  name: "iPhone15Pro",
  width: 1179,
  height: 2556,
  device: "iPhone15Pro",
  deviceType: "Phone",
  resolutionRatio: "iPhone15Pro",
  coverBackground: [{
      left: 300,
      width: 579,
      top: 70,
      height: 120,
      borderRadius: [50, 50, 50, 50]
  }]
}, {
  name: "twoCamera",
  width: 1179,
  height: 2556,
  device: "twoCamera",
  deviceType: "Phone",
  resolutionRatio: "twoCamera",
  coverBackground: [{
      left: 450,
      width: 110,
      top: 70,
      height: 100,
      borderRadius: [50, 50, 50, 50]
  }, {
      left: 629,
      width: 110,
      top: 70,
      height: 100,
      borderRadius: [50, 50, 50, 50]
  }]
}, {
  name: "iPad(1024P)",
  width: 1024,
  height: 1366,
  device: "iPad(1024P)",
  deviceType: "iPad",
  resolutionRatio: "1024P",
}, {
  name: "custom",
  width: 1080,
  height: 1920,
  device: "custom",
  deviceType: "custom",
  resolutionRatio: "custom",
}])
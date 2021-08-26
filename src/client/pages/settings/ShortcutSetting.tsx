import { ipcRenderer, clipboard } from 'electron';
let list: Array<string> = ["Control", "Alt", "Shift"];
let returnStr: string = null; //返回的值
let oldKey: string = null; //存放上一次的值
let arrList: string[] = []; //原始数组
let newArrList: string[] = []; //去重后的数组
let set: any = null; //去重后的数组

/**
 * 转大写
 * @param value  传入的值
 *
 * @returns value
 */
function toUpperCase(value) {
  try {
    return value.toUpperCase();
  } catch {
    return value;
  }
}
/**
 * 转小写
 * @param value  传入的值
 *
 * @returns value
 */
function toLowerCase(value) {
  try {
    return value.toLowerCase();
  } catch {
    return value;
  }
}
/**
 * 清空快捷键临时数据
 * @void
 */
function clearData() {
  returnStr = null;
  newArrList = [];
  arrList = [];
}
/**
 *
 * @param hasMK 是否为功能键
 * @param key   keydown触发的值
 *
 *  @returns returnStr 处理过的值
 */
function setStr(hasMK, key) {
  if (hasMK) {
    if (key === "Control") {
      arrList.push("Ctrl");
    } else {
      arrList.push(key);
    }
    set = new Set(arrList);
    newArrList = Array.from(set);
  } else {
    if (newArrList.length > 0) {
      returnStr = newArrList.join("+") + "+" + toUpperCase(key);
    } else {
      returnStr = toUpperCase(key);
      console.log(key, returnStr);
    }
  }
  oldKey = key;
  return returnStr;
}
/**
 * 
 * @param e event 原生事件  keydown
 * @returns returnStr 
 */
export const recordShortcut_keydown = (e) => {
  let key: string = String(e.key);
  if (oldKey === key) {
    return returnStr;
  }
  switch (toLowerCase(key)) {
    case "backspace":
      clearData();
      return "无";

    default:
      let hasMK: boolean = list.indexOf(key) > -1;
      return setStr(hasMK, key);
  }
};
/**
 * 
 * @param e  event 原生事件  keyup
 * 
 */
export const recordShortcut_keyup = (e) => {
  const hasMK: boolean = list.indexOf(e.key) > -1;
  if (hasMK) {
    set.delete(e.key);
    newArrList = Array.from(set);
    if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      clearData();
    }
  }
};
export const registerShortcut=(value)=>{
  clipboard.clear()
  ipcRenderer.send('SHORTCUT.REGISTER',value)



}

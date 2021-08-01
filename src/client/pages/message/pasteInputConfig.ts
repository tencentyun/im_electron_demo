import BraftEditor from "braft-editor";
import { emojiMap } from "./emoji-map";

export const getFileTypeName = (fileName: string) => {
  const match = fileName.match(/\.(\w+)$/);
  return match ? match[1] : "unknow";
};

export const getNameByLink = (link: string) => {
  const arr = link.split("/");
  const name = arr[arr.length - 1] || "";
  return decodeURIComponent(name);
};

// 从html字符串中匹配出image标签src
export const getImageSrcList = (text: string) => {
  //匹配图片（g表示匹配所有结果i表示区分大小写）
  const imgReg = /<img.*?(?:>|\/>)/gi;
  //匹配src属性
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  const arr = text.match(imgReg); // 匹配出所有的img标签
  const srcList =
    arr?.map((v) => {
      const srcs = v.match(srcReg);
      if (srcs) {
        return srcs[1];
      }
    }) || [];
  return srcList;
};

export const createElement = (htmlString: string) => {
  const currentDiv = document.createElement("div");
  currentDiv.innerHTML = htmlString;
  return currentDiv;
};

// 从html字符串中匹配出所需节点上的信息
export const getCustomBlocksInfo = (element: Element, selector: string) => {
  const childElements = element.querySelectorAll(selector);
  const customBlocksInfo = [];
  childElements.forEach((v) => {
    const value = v.innerHTML;
    customBlocksInfo.push(JSON.parse(value));
  });
  return customBlocksInfo;
};

// 计算出emji
const getReverseEmojiMap = (map: object) => {
  const data = {};
  Object.entries(map).forEach(([key, value]) => {
    data[value] = key;
  });
  return data;
};

// 根据根据HTML字符串得到最终展示文案
export const getPasteText = (htmlString: string) => {
  const ReverseEmojiMap = getReverseEmojiMap(emojiMap);
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  const contentString = htmlString.replace(
    /<img(?:.|\s)*?>/gi,
    function (item) {
      const src = item.match(srcReg)?.[1];
      const emojiValue = getNameByLink(src);
      const emojiName = ReverseEmojiMap[emojiValue];
      return emojiName;
    }
  );
  return BraftEditor.createEditorState(contentString).toText();
};

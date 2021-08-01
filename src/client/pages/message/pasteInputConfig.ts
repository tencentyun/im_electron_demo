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

//
export const getMessageElemArray = (
  text: string,
  htmlText: string,
  filePathAndBase64Map: any,
  videosInfoList: any[]
) => {
  const imgSrcList = getImageSrcList(htmlText);
  const element = createElement(htmlText);
  const videosInfo = getCustomBlocksInfo(element, ".block-video");
  const otherFilesInfo = getCustomBlocksInfo(element, ".block-file");

  const messageElementArray = [];
  const trimedText = text.trim();
  if (trimedText.length) {
    messageElementArray.push({
      elem_type: 0,
      text_elem_content: text,
    });
  }
  if (imgSrcList?.length) {
    messageElementArray.push(
      ...imgSrcList?.map((v) => ({
        elem_type: 1,
        image_elem_orig_path: filePathAndBase64Map[v],
        image_elem_level: 0,
      }))
    );
  }

  if (videosInfo?.length) {
    messageElementArray.push(
      ...videosInfo?.map((v) => {
        const item = videosInfoList.find((item) => item.videoPath === v.path);
        const {
          videoType,
          videoSize,
          videoDuration,
          videoPath,
          screenshotType,
          screenshotSize,
          screenshotWidth,
          screenshotHeight,
          screenshotPath,
        } = item;
        return {
          elem_type: 9,
          video_elem_video_type: videoType,
          video_elem_video_size: videoSize,
          video_elem_video_duration: videoDuration,
          video_elem_video_path: videoPath,
          video_elem_image_type: screenshotType,
          video_elem_image_size: screenshotSize,
          video_elem_image_width: screenshotWidth,
          video_elem_image_height: screenshotHeight,
          video_elem_image_path: screenshotPath,
        };
      })
    );
  }
  if (otherFilesInfo?.length) {
    messageElementArray.push(
      ...otherFilesInfo?.map((v) => ({
        elem_type: 4,
        file_elem_file_path: v.path,
        file_elem_file_name: v.name,
        file_elem_file_size: v.size,
      }))
    );
  }

  return messageElementArray;
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

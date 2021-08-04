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

// 得到图片的base64
export const createImgBase64Url = async (file: File) => {
  return new Promise((res) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      const base64Value = e.target.result;
      // target.result 该属性表示目标对象的DataURL
      res(base64Value);
    };
  });
};

const getMessageElemItem = (
  type: string,
  data: { text?: string; path?: string; name?: string; size?: number },
  videoInfoList?: any[]
) => {
  switch (type) {
    case "text": {
      return {
        elem_type: 0,
        text_elem_content: data.text,
      };
    }
    case "block-video": {
      const item = videoInfoList.find((item) => item.videoPath === data.path);
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
    }
    case "block-file": {
      return {
        elem_type: 4,
        file_elem_file_path: data.path,
        file_elem_file_name: data.name,
        file_elem_file_size: data.size,
      };
    }
    case "block-image": {
      return {
        elem_type: 1,
        image_elem_orig_path: data.path,
        image_elem_level: 0,
      };
    }
  }
};


// 得到最终发送的messageElemArray
export const getMessageElemArray = (rawData: any, videoInfoList: any[]) => {
  try {
    const data = JSON.parse(rawData);
    const { blocks, entityMap } = data; 

    const messageElementArray = [];

    blocks?.forEach((item) => {
      const { type, text, entityRanges } = item;
      switch (type) {
        case "unstyled": {
          const trimText = text.trim();
          if (trimText?.length) {
            messageElementArray.push(
              getMessageElemItem("text", { text: text.trim() })
            );
          }
          break;
        }
        case "atomic": {
          entityRanges.forEach((v) => {
            const { key } = v;
            const entity = entityMap[key];
            const { type: customBlockType, data } = entity;
            messageElementArray.push(
              getMessageElemItem(customBlockType, data, videoInfoList)
            );
          });
        }
      }
    });
    return messageElementArray;
  } catch (e) {
    console.log(e);
  }
  return [];
};

// 计算出emoji
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

// 得到图片的base64
export const fileImgToBase64Url = async (file: File) => {
  return new Promise((res) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      const base64Value = e.target.result;
      // target.result 该属性表示目标对象的DataURL
      res(base64Value);
    };
  });
};

export const bufferToBase64Url = (data: string, type: string) => {
  const buffer = new Buffer(data, 'binary');
  return `data:image/${type};base64,` + buffer.toString('base64');
} 

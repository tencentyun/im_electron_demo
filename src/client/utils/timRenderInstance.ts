import TimRender from "im_electron_sdk/dist/renderer";
import { message } from "tea-component";
import { isNumber } from "lodash";

let timRenderInstance: TimRender;

const getInstance = ():TimRender => {
    if(!timRenderInstance) {
        const renderInstance = new TimRender();
        const proxedInstance = new Proxy(renderInstance, {
            get: (obj, prop) => {
                return async (...args) => {
                    const res = await obj[prop](...args);
                    if (res.data.code !== 0)  {
                        const {data: {code, desc} } = res;
                        console.error("接口出错:", prop, code, desc);
                        return message.error({content: ` ${String(prop)} 接口出错：${desc}`});
                    } 
                    return  res
                }
            }
        });
        timRenderInstance = proxedInstance;
    }
    return timRenderInstance;
}

export default getInstance();
 
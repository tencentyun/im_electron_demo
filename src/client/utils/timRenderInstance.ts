// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TimRender from "im_electron_sdk/dist/renderer";

let timRenderInstance: any;

const getInstance = () => {
    if(!timRenderInstance) {
        timRenderInstance = new TimRender();
    }
    return timRenderInstance;
}

export default getInstance();
 
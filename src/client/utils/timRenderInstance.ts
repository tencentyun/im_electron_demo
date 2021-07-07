import TimRender from "im_electron_sdk/dist/renderer";

let timRenderInstance: TimRender;

const getInstance = ():TimRender => {
    if(!timRenderInstance) {
        timRenderInstance = new TimRender();
    }
    return timRenderInstance;
}
export default getInstance();
 
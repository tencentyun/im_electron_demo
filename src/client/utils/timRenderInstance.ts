import TimRender from "im_electron_sdk/dist/timRender";

let timRenderInstance: TimRender;

const getInstance = () => {
    if(!timRenderInstance) {
        timRenderInstance = new TimRender();
    }
    return timRenderInstance;
}
export default getInstance();


 
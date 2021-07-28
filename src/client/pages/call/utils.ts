import { message } from 'tea-component';

function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

export const getUserData = () => {
    try {
        const { convInfo, convId } = JSON.parse(getQueryString('data'));
        return {
            userId: decodeURIComponent(convId),
            convInfo
        }
    } catch (e) {
        message.warning({ content: '获取用户信息失败'})
    }
}
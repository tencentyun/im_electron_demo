const path = require("path")

const MINSIZEWIN = 'MINSIZEWIN';
const RENDERPROCESSCALL = 'RENDERPROCESSCALL';
const MAXSIZEWIN = 'MAXSIZEWIN';
const CLOSE = 'CLOSE';
const SHOWDIALOG = 'SHOWDIALOG';
const DOWNLOADFILE = 'DOWNLOADFILE';
const GET_VIDEO_INFO = 'GET_VIDEO_INFO';
const SELECT_FILES = 'SELECT_FILES';
const SELECT_FILES_CALLBACK = 'SELECT_FILES_CALLBACK';
const DOWNLOAD_PATH = path.resolve(process.cwd(), "download/")
const OPEN_CALL_WINDOW = 'OPEN_CALL_WINDOW';
const CALL_WINDOW_CLOSE = 'CALL_WINDOW_CLOSE';
const CALL_WINDOW_CLOSE_REPLY = 'CALL_WINDOW_CLOSE_REPLY';
const GET_VIDEO_INFO_CALLBACK = 'GET_VIDEO_INFO_CALLBACK';

module.exports = {
    MINSIZEWIN,
    RENDERPROCESSCALL,
    MAXSIZEWIN,
    CLOSE,
    SHOWDIALOG,
    DOWNLOADFILE,
    GET_VIDEO_INFO,
    SELECT_FILES,
    SELECT_FILES_CALLBACK,
    DOWNLOAD_PATH,
    OPEN_CALL_WINDOW,
    CALL_WINDOW_CLOSE,
    CALL_WINDOW_CLOSE_REPLY,
    GET_VIDEO_INFO_CALLBACK
}
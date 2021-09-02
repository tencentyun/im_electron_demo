import React, { useEffect, useState } from 'react';
import { Tabs, TabPanel, Modal, Button } from 'tea-component';
import { useDialog } from "../../utils/react-use/useDialog";
import { EmptyResult } from '../../pages/message/searchMessage/EmptyResult';
import { searchImgMessage } from '../../pages/message/api'
import PicElemItem from "../../pages/message/messageElemTyps/picElemItem";
import VideoElem from "../../pages/message/messageElemTyps/videoElem";
import './chatRecord.scss'
import { formatDate } from '../../utils/tools'


export const ChatRecord = (props) => {
    const { dialogRef, conv_type, conv_id } = props;
    const [visible, setShowState] = useDialog(dialogRef, {});
    const [imgList, setImgList] = useState([])
    const [searchResult, setSearchResult] = useState({
        messageResult: [{
            msg_search_result_total_count: 0,
            msg_search_result_item_array: []
        }],
        groupResult: [{
            msg_search_result_total_count: 0,
            msg_search_result_item_array: []
        }],
        friendsResult: [{
            msg_search_result_total_count: 0,
            msg_search_result_item_array: []
        }]
    });
    const onClose = () => setShowState(false);

    const groupResult = searchImgMessage({
        messageType: 1,
        convType: conv_type,
        convId: conv_id
    });

    const friendsResult = searchImgMessage({
        messageType: 2,
        convType: conv_type,
        convId: conv_id
    });

    const searchGroupAllResult = searchImgMessage({
        messageType: 9,
        convType: conv_type,
        convId: conv_id
    });

    const searchImgVideo = async () => {
        Promise.all([groupResult, friendsResult, searchGroupAllResult]).then(searchResult => {
            const [messageResult, groupResult, friendsResult] = searchResult;
            setSearchResult({
                messageResult,
                groupResult,
                friendsResult,
            });
        });
        console.log("searchResultsearchResult", searchResult)
    }
    const displayDiffMessage = (message, element, index) => {
        const { elem_type, ...res } = element;
        console.log("displayDiffMessagedisplayDiffMessage", message)
        let resp;
        switch (elem_type) {
            case 1:
                resp = <div className='message-item'>
                    <PicElemItem {...res} />
                    <div className='meeeage-time'>
                        {formatDate(message.message_server_time * 1000)}
                    </div>
                </div>

                break;
            case 9:
                resp = <VideoElem message={message} {...res} />;
                break;
        }
        return resp;
    }

    const htmlRest = (imgListRest) => {
        return (
            imgListRest.msg_search_result_item_array ?
                imgListRest.msg_search_result_item_array[0].msg_search_result_item_message_array.length ? <div style={{display:'flex',flexWrap:'wrap'}}>
                    {
                        imgListRest.msg_search_result_item_array[0].msg_search_result_item_message_array.map((item, index) =>
                            displayDiffMessage(item, item.message_elem_array[0], index)
                        )
                    }
                </div> : <EmptyResult contentText="没有相关信息呦~" /> : <EmptyResult contentText="没有相关信息呦~" />)
    }

    useEffect(() => {
        if (visible) {
            searchImgVideo()
        }
    }, [visible])

    const generateTabList = () => {
        const { friendsResult, messageResult, groupResult } = searchResult;
        const tabList = [{
            id: 'contacter',
            label: `图片(${messageResult?.msg_search_result_total_count})`
        }, {
            id: 'group',
            label: `视频(${friendsResult?.msg_search_result_total_count})`
        }, {
            id: 'message',
            label: `音频(${groupResult?.msg_search_result_total_count})`
        }];

        return tabList;
    }

    return (
        <Modal
            className="search-message-modal"
            disableEscape
            visible={visible}
            size="85%"
            disableCloseIcon
        >
            <Modal.Body>
                <div className='pendency-title'>
                    图片语音与视频
                </div>
                <div>
                    <section className="search-message__tab">
                        <Tabs tabs={generateTabList()} >
                            <TabPanel id="contacter">
                                {
                                    htmlRest(searchResult.messageResult)
                                }
                            </TabPanel>
                            <TabPanel id="group">
                                {
                                    htmlRest(searchResult.friendsResult)
                                }
                            </TabPanel>
                            <TabPanel id="message">
                                {
                                    htmlRest(searchResult.groupResult)
                                }
                            </TabPanel>
                        </Tabs>
                    </section>

                </div>
                <Modal.Footer>
                    <Button type="weak" onClick={onClose} style={{ marginBottom: "20px" }}>
                        关闭
                    </Button>
                </Modal.Footer>
            </Modal.Body>
        </Modal>
    )
}
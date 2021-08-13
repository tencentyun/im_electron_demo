import { useState, useEffect } from "react";
import { uniqBy, differenceBy } from 'lodash';

type userList = {
    userId: string
    isEntering: boolean,
    isMicOpen: boolean,
    isSpeaking: boolean
}

const splitUserListFunc = (array, count) => {
    const catchArray = [];
    for (let i = 0; i < array.length; i += count) {
        catchArray.push(array.slice(i, i + count));
    }
    return catchArray;
};

const generateTmp = (userId) => ({
    userId,
    isEntering: false,
    isMicOpen: true,
    isSpeaking: false
});

const useUserList = (originUserList) : [Array<Array<userList>> , (userId: string) => void, (userId: string) => void, (userId: string, available: boolean) => void, (userIds: Array<string>) => void] => {
    const [userList, setUserList] = useState([]);
    const [splitUserList, setSplitUserList] = useState([]);

    useEffect(() => {
        if(userList.length > 0) {
            setUserList(prev => prev.filter(item => originUserList.includes(item.userId)));
            return;
        }
        const formatedUserList = originUserList.map(userId => generateTmp(userId));
        const uniqUserList = uniqBy(formatedUserList, 'userId');
        setUserList(uniqUserList);
    }, [originUserList.length]);

    useEffect(() => {
        const splitUserList = splitUserListFunc(userList, 9);
        setSplitUserList(splitUserList);
        console.log('==========split user list=========', splitUserList);
    }, [userList])

    const deleteUser = userId => setUserList(prev => prev.filter(item => item.userId !== userId));

    const setUserEntering = userId => setUserList(prev => prev.map(item => {
        if(item.userId === userId) {
            return {
                ...item,
                isEntering: true,
            }
        }
        return item;
    }));

    const setUserAudioAvailable = (userId, available) => setUserList(prev => prev.map(item => {
        if(item.userId === userId) {
            return {
                ...item,
                isMicOpen: available
            }
        }
        return item;
    }));

    const setUserSpeaking = userIds => setUserList(prev => prev.map(item => {
            return {
                ...item,
                isSpeaking: userIds.includes(item.userId)
            }
    }))

    return [splitUserList, deleteUser, setUserEntering, setUserAudioAvailable, setUserSpeaking];
};

export default useUserList;
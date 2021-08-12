import { useState, useEffect } from "react";
import { uniqBy } from 'lodash';

type userList = {
    userId: string
    isEntering: boolean,
    isMicOpen: boolean
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
    isMicOpen: true
});

const useUserList = (originUserList) : [Array<Array<userList>> , (userId: string) => void, (userId: string) => void, (userId: string, available: boolean) => void] => {
    const [userList, setUserList] = useState([]);
    const [splitUserList, setSplitUserList] = useState([]);

    console.log('originUserList', originUserList);

    useEffect(() => {
        const formatedUserList = originUserList.map(userId => generateTmp(userId));
        const uniqUserList = uniqBy(formatedUserList, 'userId');
        setUserList(uniqUserList);
    }, [originUserList.length]);

    useEffect(() => {
        console.log('===========userList=========', userList);
        const splitUserList = splitUserListFunc(userList, 9);
        setSplitUserList(splitUserList);
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

    return [splitUserList, deleteUser, setUserEntering, setUserAudioAvailable];
};

export default useUserList;
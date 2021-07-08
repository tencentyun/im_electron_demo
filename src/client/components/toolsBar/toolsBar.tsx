import React from 'react';
import { isWin } from '../../utils/tools';
import { Mac } from './mac';
import { Windows } from './windows';
/**
 * 工具栏 windows和mac要区分一下，目前只区分窗口操作的按钮
 * @returns 
 */
export const ToolsBar = (): JSX.Element => {
    return isWin()? <Windows/> : <Mac/>
}
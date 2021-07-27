import React, { ReactNode, useState } from 'react';
import { Radio } from 'tea-component';

import './index.scss';

type OptionItem = {
    text: string | ReactNode,
    id: string,
}

type Props = {
    isMultiSelect?: boolean,
    options: Array<OptionItem>,
    onSelect?: (optionItem: OptionItem) => void
}

export const Menu = (props: Props) => {
    const { isMultiSelect = false, options, onSelect } = props;

    const handleRadioButtonClick = (item: OptionItem) => {
        console.log(item);
    }

    const handleItemClick = (item: OptionItem) => {
        !isMultiSelect && onSelect && onSelect(item);
    };

    return <div className="menu-content">
        {
            options.map(item => {
                const { text, id } = item;
                <li className="menu-content__item" key={id} onClick={() => handleItemClick(item)}>
                    {isMultiSelect && <Radio onClick={() => handleRadioButtonClick(item)} />    }
                    <span className="menu-content__item--text">{text}</span>
                </li>
            })
        }
    </div>
};
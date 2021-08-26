import React from 'react';
import { shell,app } from 'electron';
import { Button } from 'tea-component';

import './login-about.scss';
import loginBg from '../../assets/icon/login-bg.png';
import { PURCHASE_LINK, CONTACT_LINK } from '../../constants';

export const LoginAbout = (): JSX.Element => {
    const handlePurchaseClick = () => {
        shell.openExternal(PURCHASE_LINK);
    };

    const handleContactClick = () => {
        shell.openExternal(CONTACT_LINK);
    }
    return (
        <div className="login-about">
            <section className="login-about__header">
                <span className="login-about__header--logo" />
                <span className="login-about__header--tc-text">华润银行</span>
                <span className='login-about__header--split' />
                <span className='login-about__header--im-text'>员工工作平台</span>
            </section>
            <section className="login-about__text">
                <p>
                以即时通讯为基础，打造统一的员工工作和沟通平台
                </p>
                <p>
                实现员工互联互通，助推信息流的快速传递，实现高效企业协同办公。
                </p>
            </section>
            <section className="login-about__logo" >
                <img src={loginBg}></img>
            </section>
            {/* <section className="login-about__button">
                <Button type="weak" className="login-about__button--purchase" onClick={handlePurchaseClick}>立即选购</Button>
                <Button type="text" className="login-about__button--contact" onClick={handleContactClick}>联系我们</Button>
            </section> */}
        </div>
    )
};
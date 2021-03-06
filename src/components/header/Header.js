import React, { useState, useEffect } from 'react'
import { FaTimes, } from 'react-icons/fa';
import { social, links } from './data';
import logoDark from './logoDark.png'
import logoLight from './logoLight.png'
import { Link } from 'react-router-dom'
import NavbarMobile from './NavbarMobile';
import HeaderSearch from './HeaderSearch';
import HeaderControl from './HeaderControl';
import ReactNotification from 'react-notifications-component'
import notificationCustom from '../../notification';
import requestAPI from '../../api';
import { cartReceived } from '../../features/cart/CartSlice';
import { useDispatch } from 'react-redux';
import { login, register, logout, changePassword } from '../../features/account/accountSlice';
// Alternate way to use classes without prefix like `animated fadeIn`
const getStorageTheme = () => {
    let theme = 'light-theme';
    if (localStorage.getItem('theme')) {
        theme = localStorage.getItem('theme');
    }
    return theme;
};

export default function Navbar(props) {
    const [theme, setTheme] = useState(getStorageTheme());
    const [darkMode, setDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [confirmLogin, setConfirmLogin] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [dataAccount, setDataAccount] = useState()
    const [APIAccount, setAPIAccount] = useState()
    const dispatch = useDispatch();
    const handleSocial = (status) => {
        props.handleStatusSocial(status);
    }
    const toggleTheme = () => {

        if (theme === 'light-theme') {
            setTheme('dark-theme');
            setDarkMode(true)
        } else {
            setTheme('light-theme');
            setDarkMode(false)
        }
    };

    useEffect(() => {
        document.documentElement.className = theme;
        if (theme === 'dark-theme') {
            setDarkMode(true)
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    useEffect(() => {
        if (localStorage.getItem('TOKEN')) {
            setConfirmLogin(true)
            setIsLogin(false)
            requestAPI(`/cart/Load`, 'GET', null, { Authorization: `Bearer ${localStorage.getItem('TOKEN')}` })
                .then(res => {
                    if (res) {
                        console.log({ CartLoading: res.data });
                        dispatch(cartReceived(res.data));
                    }
                })
                .catch(err => {
                    if (err.response) {
                        if (err.response.status === 403) {
                            console.log("TOKEN TIME OUT");
                        }
                        if (err.response.status === 500) {
                            console.log({ err });
                        }
                    }
                })
        }

    }, []);
    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    const handleIsLogin = (status) => {
        setIsLogin(status)
    }
    const handleIsRegister = (status) => {
        setIsRegister(status)
        if (status === true) {
            setIsLogin(false);
        }
    }
    const handleLogin = (acc) => {
        if (!acc || !acc.username || !acc.password) {
            notificationCustom("Nh???c Nh???", "Vui l??ng nh???p ?????y ????? c??c tr?????ng", "danger")
        } else if (acc) {
            requestAPI('/account/signin', 'POST', acc)
                .then(res => {
                    setAPIAccount(res.data);
                    setConfirmLogin(true);
                    setIsLogin(false);
                    notificationCustom("Th??ng B??o", `Xin Ch??o, ${res.data.fullname}`, "success")
                    localStorage.setItem('TOKEN', res.data.accessToken)
                    localStorage.setItem('USERNAME', res.data.fullname)
                    window.location.reload();
                })
                .catch(err => {
                    if (err.response) {
                        if (err.response.status === 500) {
                            notificationCustom("Nh???c Nh???", `Sai t??i kho???n ho???c m???t kh???u`, "warning")
                        }
                        else if (err.response.status === 304) {
                            notificationCustom("Nh???c Nh???", `T??i kho???n c???a b???n ???? b??? kh??a,do s??? d???ng t??? ng??? th?? t???c,
                             vui l??ng li??n h??? ?????a ch??? email : khieunai.mbook@gmail.com ????? m??? kh??a`, "danger")
                        }
                    }
                })
        }
    }
    const handleRegister = (accountRegister) => {

        requestAPI('/account/signup', 'POST', accountRegister)
            .then(res => {

                notificationCustom("Ch??c m???ng", `Ch??o m???ng ${accountRegister.fullname} ?????n v???i M - book`, "success")
                setIsRegister(false);
                setIsLogin(true);
                dispatch(register(res.data))
            }).catch(err => {
                if (err.response.status === 409) {
                    notificationCustom("Nh???c Nh???", `T??i Kho???n ???? T???n T???i`, "warning")
                } else if (err.response.status === 404) {
                    notificationCustom("Nh???c Nh???", `Server ??ang b???o tr??`, "warning")
                }
                console.log(err);
                return;
            })
    }
    const handleCheckedBox = (e) => {
        console.log(`checked = ${e.target.checked}`);
    }
    const handleIsChangePassword = (status) => {
        setIsChangePassword(status)
    }
    const handleChangePassword = (password) => {
        if (password.passwordNew !== password.repeatpasswordNew) {
            notificationCustom("Nh???c Nh???", `X??c nh???n m???t kh???u ch??a tr??ng kh???p`, "warning")
            return;
        }
        requestAPI('/account/changepassword', 'PUT', password, { Authorization: `bearer ${localStorage.getItem('TOKEN')}` })
            .then(res => {
                notificationCustom("Th??ng B??o", `?????i m???t kh???u th??nh c??ng`, "success")
                setAPIAccount(res.data)
                setIsChangePassword(false);
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status === 409) {
                        notificationCustom("Nh???c Nh???", `M???t kh???u m???i kh??ng ???????c tr??ng v???i m???t kh???u c??`, "warning")
                    } else if (err.response.status === 304) {
                        notificationCustom("Nh???c Nh???", `M???t kh???u c?? ch??a ????ng`, "warning")
                    }
                } else {
                    console.log(err);
                }
            })

    }
    const handleLogOut = (status) => {
        setConfirmLogin(!status)
        setAPIAccount('');
        setIsLogin(status)
        dispatch(register())
        localStorage.removeItem('TOKEN')
        localStorage.removeItem('USERNAME')
        window.location.reload();
    }
    return (
        <div className='header-wrapper'>
            <ReactNotification />
            <div className='header'>
                {/* =================== MENU MOBIE ================== */}
                <NavbarMobile
                    openSidebar={openSidebar}
                    isSidebarOpen={isSidebarOpen}
                    darkMode={darkMode}
                    logoDark={logoDark}
                    logoLight={logoLight}
                    FaTimes={FaTimes}
                    links={links}
                    social={social}
                    toggleTheme={toggleTheme}
                />
                {/* =================== LOGO ================== */}
                <Link className='header__logo' to='/'>
                    {
                        darkMode ? <img src={logoDark} alt='logo' /> : <img src={logoLight} alt='logo' />
                    }
                </Link>


                {/* =================== SEARCH ================== */}

                <HeaderSearch
                    darkMode={darkMode}
                    toggleTheme={toggleTheme}
                    handleSocial={handleSocial}
                />

                {/* =================== CONTROL ================== */}

                <HeaderControl
                    handleIsLogin={handleIsLogin}
                    isLogin={isLogin}
                    handleLogin={handleLogin}
                    handleIsRegister={handleIsRegister}
                    isRegister={isRegister}
                    handleCheckedBox={handleCheckedBox}
                    handleRegister={handleRegister}
                    // avatar={avatar}
                    confirmLogin={confirmLogin}
                    dataAccount={dataAccount}
                    isChangePassword={isChangePassword}
                    handleIsChangePassword={handleIsChangePassword}
                    handleChangePassword={handleChangePassword}
                    APIAccount={APIAccount}
                    handleLogOut={handleLogOut}
                ></HeaderControl>

            </div>
        </div >
    )
}
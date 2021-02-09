import Cookies from 'js-cookie'


export const setCookie = (key, value) => {
    if (window !== 'undefined') {
        Cookies.set(key, value, { expires: 1 })
    }
}

export const removeCookie = (key, value) => {
    if (window !== 'undefined') {
        Cookies.remove(key, value)
    }
}

export const getCookie = key => {
    Cookies.get(key)
}

export const setLocalStorage = (key, value) => {
    if (window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

export const removeLocalStorage = (key) => {
    if (window !== "undefined") {
        localStorage.removeItem(key)
    }

}

export const authenticate = (response, next) => {
    setCookie('token', response.data.token)
    setLocalStorage('user', response.data.user)
    next()
}

export const logout = next => {
    removeCookie('token')
    removeLocalStorage('user')
}

export const isAuth = () => {
    if (window !== 'undefined') {
        const checkCookie = getCookie('token')
        if (checkCookie) {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user'))
            }
            else {
                return false
            }
        }
    }
}

export const updateUser = (response, next) => {
    if (window !== 'undefined') {
        let auth = JSON.parse(localStorage.getItem('user'))
        auth = response.data
        localStorage.setItem('user', JSON.stringify(auth))
    }
    next()
}
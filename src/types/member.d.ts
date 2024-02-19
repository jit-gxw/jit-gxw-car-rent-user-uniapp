

//微信登录返回用户信息
export type LoginResult = {
    id: number
    openid: string
    status: Number,
    name: String,
    phone: String,
    sex: String,
    idNumber: String,
    licenceId: String,
    avatar: String,
    createTime: String,
    updateTime: String,
    token: string
}
//查看个人信息
export type PersonInfo = {
    id: Number,
    openid: String,
    status: Number,
    name: String,
    phone: String,
    sex: String,
    idNumber: String,
    licenceId: String,
    avatar: String,
    createTime: String,
    updateTime: String
}
//更新个人信息
export type UpdatePersonInfo = {
    name: String,
    phone: String,
    sex: String,
    idNumber: String,
    licenceId: String,
    avatar: String,
}


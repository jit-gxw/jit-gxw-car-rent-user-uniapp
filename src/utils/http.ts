import { useMemberStore } from '@/stores'
import { error } from 'console'
// 请求基地址
const baseURL = 'http://192.168.2.10:8080'

//添加拦截器
const httpInterceptor = {
  //拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1. 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }// 2. 请求超时, 默认 60s
    options.timeout = 10000
    //  添加 token 请求头标识
    options.header = {
      ...options.header,
    }
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)


//请求函数
type Data<T> = {
  code: string
  msg: string
  data: T
}
export const http = <T>(options: UniApp.RequestOptions) => {
  //返回promise对象
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      //请求成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
        if (res.statusCode >= 200 && res.statusCode < 300 && (res.data as Data<T>).code === 1) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
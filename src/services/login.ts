import type { LoginResult } from "@/types/member"
import { http } from "@/utils/http"


type LoginParams = {
    code: string
}
/**
 * 微信登录
 * @param data 
 * @returns 
 */
export const loginService = (data: LoginParams) => {
    return http<LoginResult>({
        method: 'POST',
        url: '/user/user/login',
        data,
    })

}
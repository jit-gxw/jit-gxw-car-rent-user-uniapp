import { http } from "@/utils/http"
import type { PersonInfo, UpdatePersonInfo } from "@/types/member"

/**
 * 获取个人信息
 * @returns 
 */
export const searchInfoService = () => {
    return http<PersonInfo>({
        method: 'GET',
        url: '/user/user'
    })
}
/**
 * 修改个人信息
 * @param data 
 * @returns 
 */
export const updatePersonInfoService = (data: UpdatePersonInfo) => {
    return http({
        method: 'PUT',
        url: '/user/user',
        data,
    })
}

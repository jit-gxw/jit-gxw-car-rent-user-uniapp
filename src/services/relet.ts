import { http } from "@/utils/http"
import type { ReletSubmitType, ReletPageType, ReletPageReturnType, AppointmentType } from '@/types/appointment'
/**
 * 提交续租
 * @returns 
 */
export const SubmitReletService = (data: ReletSubmitType) => {
    return http({
        method: 'POST',
        url: '/user/relet/submit',
        data
    })
}
//分页查询
export const SearchReletService = (data: ReletPageType) => {
    return http<ReletPageReturnType>({
        method: 'GET',
        url: '/user/relet',
        data
    })
}
//取消预约
export const CancelReletService = (id: number) => {
    return http({
        method: 'PUT',
        url: `/user/relet/cancel/${id}`
    })
}


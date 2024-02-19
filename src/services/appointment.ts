import { http } from "@/utils/http"
import type { AppointmentSubmitType, AppointmentPageType, AppointmentType, AppointmentPageReturnType } from '@/types/appointment'
/**
 * 提交预约
 * @returns 
 */
export const SubmitAppointmentService = (data: AppointmentSubmitType) => {
    return http({
        method: 'POST',
        url: '/user/appointment/submit',
        data
    })
}
//分页查询
export const SearchAppointmentService = (data: AppointmentPageType) => {
    return http<AppointmentPageReturnType>({
        method: 'GET',
        url: '/user/appointment',
        data
    })
}
//取消预约
export const CancelAppointmentService = (id: number) => {
    return http({
        method: 'PUT',
        url: `/user/appointment/cancel/${id}`
    })
}


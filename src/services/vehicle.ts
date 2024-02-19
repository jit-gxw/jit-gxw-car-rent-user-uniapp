import { http } from "@/utils/http"
import type { PageVehicleType, VehicleType } from '@/types/vehicle'
/**
 * 获取车辆信息
 * @returns 
 */
export const searchVehicleService = (params: PageVehicleType) => {
    return http<VehicleType[]>({
        method: 'GET',
        url: '/user/vehicle/list',
        data: params,
    })
}

/**
 * 根据id查询车辆信息
 * @param id 
 * @returns 
 */

export const searchVehicleByIdService = (id: number) => {
    return http<VehicleType>({
        method: 'GET',
        url: '/user/vehicle',
        data: { id },
    })
}



import type { OrderType } from '@/types/order'

//发起续租数据
export type ReletSubmitType = {
    ordersId: number,
    returnTime: string,
    reletInfo: string
}
//分页查询数据
export type ReletPageType = {
    page: number,
    pageSize: number
}
//分页返回数据
export type ReletPageReturnType = {
    total: number,
    records: AppointmentType[]
}
//续租信息
export type ReletType = {
    id: number,
    ordersId: number,
    number: string,
    status: number,
    collectionTime: string,
    returnTime: string,
    reletInfo: string,
    reletTime: string,
    cancelReason: string,
    rejectionReason: string,
    cancelTime: string,
    passTime: string,
    order: OrderType,
}

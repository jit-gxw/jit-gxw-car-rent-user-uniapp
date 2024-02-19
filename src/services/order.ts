import { http } from "@/utils/http"
import type { OrderPageType, OrderType, OrderPageReturnType } from '@/types/order'

//分页查询
export const SearchOrderService = (data: OrderPageType) => {
    return http<OrderPageReturnType>({
        method: 'GET',
        url: '/user/order/historyOrders',
        data
    })
}

//取消订单
export const CancelOrderService = (params: number) => {
    return http({
        method: 'PUT',
        url: `/user/order/cancel/${params}`,
    })
}
//查询订单详情
export const DetailOrderService = (params: number) => {
    return http<OrderType>({
        method: 'GET',
        url: `/user/order/orderDetail/${params}`,
    })
}
//订单支付
export const PaymentOrderService = (data) => {
    return http({
        method: 'PUT',
        url: `/user/order/payment`,
        data,
    })
}


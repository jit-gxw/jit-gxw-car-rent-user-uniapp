//分页查询数据
export type OrderPageType = {
    page: number,
    pageSize: number,
    status: number
}
//分页返回数据
export type OrderPageReturnType = {
    total: number,
    records: OrderType[]
}

//订单数据
export type OrderType = {
    id: number,
    number: string,
    status: number,
    reletStatus: number,
    appointmentId: number,
    reletId: number,
    userId: number,
    vehicleId: number,
    vehicleName: string,
    licensePlateNumber: string,
    cashPledge: number,
    image: string,
    collectionTime: string,
    returnTime: string,
    remark: string,
    payStatus: number,
    cashPledgeStatus: number,
    extraCharges: number,
    amount: number,
    userName: string,
    idNumber: string,
    licenceId: string,
    phone: string,
    cancelTime: string,
    cancelReason: string,
    orderTime: string,
    completionTime: string


}
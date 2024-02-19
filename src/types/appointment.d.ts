

//发起预约数据
export type AppointmentSubmitType = {
    vehicleId: number,
    collectionTime: string,
    returnTime: string,
    appointmentInfo: string
}
//分页查询数据
export type AppointmentPageType = {
    page: number,
    pageSize: number
}
//分页返回数据
export type AppointmentPageReturnType = {
    total: number,
    records: AppointmentType[]
}
//预约信息
export type AppointmentType = {
    id: number,
    userId: number,
    vehicleId: number,
    vehicleName: string,
    licensePlateNumber: string,
    image: string,
    priceDay: number,
    priceMonth: number,
    status: number,
    collectionTime: string,
    returnTime: string,
    appointmentInfo: string,
    appointmentTime: string,
    cancelReason: string,
    rejectionReason: string,
    cancelTime: string,
    passTime: string
    number: string
}

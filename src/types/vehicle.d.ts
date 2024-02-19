

//分页查询数据
export type PageVehicleType = {
    begin: string,
    end: string,
    classificationId: number
}

//车辆信息
export type VehicleType = {
    id: number,
    licensePlateNumber: string,
    name: string,
    classificationId: number,
    cashPledge: number,
    seating: string,
    image: string,
    status: number,
    priceDay: number,
    priceMonth: number,
    description: string,
    classificationName: string
}
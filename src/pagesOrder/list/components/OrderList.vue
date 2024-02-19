<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { OrderPageType, OrderType } from '@/types/order'
import { SearchOrderService, CancelOrderService, PaymentOrderService } from '@/services/order'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

//订单列表
const orderData = ref<OrderType[]>([])

//分页数据
// 定义 porps
const props = defineProps<{
    orderState: number
}>()
const pageData: Required<OrderPageType> = {
    page: 1,
    pageSize: 5,
    status: props.orderState
}
//查询订单信息
const getOrderData = async () => {

    if (isFinish.value === true) {
        return uni.showToast({ icon: 'none', title: '没有更多数据~' })
    }

    await SearchOrderService(pageData)
        .then((result) => {
            // 数组追加
            orderData.value.push(...result.data.records)
            // 分页条件
            if (pageData.page * pageData.pageSize < result.data.total) {
                // 页码累加
                pageData.page++
            } else {
                // 分页已结束
                isFinish.value = true
            }
        })
}

// 页面加载
onMounted(() => {
    getOrderData()
})
// 是否分页结束
const isFinish = ref(false)
// 是否触发下拉刷新
const isTriggered = ref(false)
// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
    // 开始动画
    isTriggered.value = true
    // 重置数据
    pageData.page = 1
    orderData.value = []
    isFinish.value = false
    // 加载数据
    await getOrderData()
    // 关闭动画
    isTriggered.value = false
}

//取消订单
const CancelHandel = (id: number) => {
    uni.showModal({
        title: '提示',
        content: '是否取消订单？',
        showCancel: true,
        success: async ({ confirm }) => {
            if (confirm) {
                //取消
                await CancelOrderService(id)
                    .then((result) => {
                        uni.showToast({
                            title: '取消成功！',
                            icon: 'success',
                            mask: true
                        })
                        onRefresherrefresh()
                    }).catch((err) => {
                        uni.showToast({
                            title: '取消失败！',
                            icon: 'error',
                            mask: true
                        })
                    });
            }
        }
    })
}
// 订单支付
const onOrderPay = async (number: string) => {

    await PaymentOrderService({ number: number })
        .then((result: any) => {
            uni.showToast({ title: '支付成功' })
            onRefresherrefresh()
        }).catch((err: any) => {
            uni.showToast({ title: '支付失败', icon: 'error' })
        });
}


</script>

<template>
    <scroll-view enable-back-to-top scroll-y class="orders" refresher-enabled :refresher-triggered="isTriggered"
        @refresherrefresh="onRefresherrefresh" @scrolltolower="getOrderData">



        <view class="card" v-for="item in orderData" :key="item.id">
            <!-- 车辆信息 -->
            <view class="status">
                <text class="date">{{ item.orderTime }}</text>
                <!-- 订单状态文字 -->
                <text>{{ item.status === 0 ? '待付押金'
                    : item.status === 1 ? '待取车'
                        : item.status === 2 ? '租赁中'
                            : item.status === 3 ? '已还车'
                                : item.status === 4 ? '待付款'
                                    : item.status === 5 ? '已完成' : '已取消' }}</text>

            </view>
            <!-- 商品信息，点击商品跳转到订单详情，不是商品详情 -->
            <navigator class="goods" hover-class="none" :url="`/pagesOrder/detail/detail?id=${item.id}`">

                <view class="cover">
                    <image mode="aspectFit" :src="item.image">
                    </image>
                </view>
                <view class="meta">
                    <view class="name ellipsis">{{ item.vehicleName }}</view>
                    <view class="type">{{ item.licensePlateNumber }}</view>

                </view>

            </navigator>
            <!-- 预约信息 -->

            <view class="payment">
                <text class="quantity">租赁时间：{{ item.collectionTime }}至{{ item.returnTime }}</text>
                <view v-if="item.status === 0">
                    <text>押金</text>
                    <text class="amount"> <text class="symbol">¥</text>{{ item.cashPledge }}</text>
                </view>
                <view v-else>
                    <text>费用</text>
                    <text class="amount"> <text class="symbol">¥</text>{{ item.amount }}</text>
                </view>


            </view>
            <view>
                <text class="quantity" style="font-size: 24rpx;
              margin-left: 24rpx;" v-if="item.status === 5 || item.status === 6">处理时间：{{ item.cancelTime ||
                  item.completionTime }}</text>
            </view>
            <!-- 订单操作按钮 -->
            <view class="action">
                <!-- 待付款状态：显示支付按钮 -->
                <template v-if="item.status === 0 || item.status === 1">
                    <view class="button" @tap="CancelHandel(item.id)">取消</view>
                </template>
                <template v-if="item.status === 0 || item.status === 4">
                    <view class="button primary" @tap="onOrderPay(item.number)">支付</view>
                </template>
            </view>
        </view>
        <!-- 底部提示文字 -->
        <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
            {{ true ? '没有更多数据~' : '正在加载...' }}
        </view>
    </scroll-view>
</template>

<style lang="scss">
// 订单列表
.orders {
    .card {
        min-height: 100rpx;
        padding: 20rpx;
        margin: 20rpx 20rpx 0;
        border-radius: 10rpx;
        background-color: #fff;

        &:last-child {
            padding-bottom: 40rpx;
        }
    }

    .status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 28rpx;
        color: #999;
        margin-bottom: 15rpx;

        .date {
            color: #666;
            flex: 1;
        }

        .primary {
            color: #ff9240;
        }

        .icon-delete {
            line-height: 1;
            margin-left: 10rpx;
            padding-left: 10rpx;
            border-left: 1rpx solid #e3e3e3;
        }
    }

    .goods {
        display: flex;
        margin-bottom: 20rpx;

        .cover {
            width: 170rpx;
            height: 170rpx;
            margin-right: 20rpx;
            border-radius: 10rpx;
            overflow: hidden;
            position: relative;
        }

        .quantity {
            position: absolute;
            bottom: 0;
            right: 0;
            line-height: 1;
            padding: 6rpx 4rpx 6rpx 8rpx;
            font-size: 24rpx;
            color: #fff;
            border-radius: 10rpx 0 0 0;
            background-color: rgba(0, 0, 0, 0.6);
        }

        .meta {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .name {
            height: 80rpx;
            font-size: 26rpx;
            color: #444;
        }

        .type {
            line-height: 1.8;
            padding: 0 15rpx;
            margin-top: 10rpx;
            font-size: 24rpx;
            align-self: flex-start;
            border-radius: 4rpx;
            color: #888;
            background-color: #f7f7f8;
        }

        .more {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22rpx;
            color: #333;
        }
    }

    .payment {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        line-height: 1;
        padding: 20rpx 0;
        text-align: left;
        color: #999;
        font-size: 28rpx;
        border-bottom: 1rpx solid #eee;

        .quantity {
            font-size: 22rpx;
            margin-right: 30rpx;
        }

        .amount {
            color: #444;
            margin-left: 20rpx;
        }

        .symbol {
            font-size: 30rpx;
        }
    }

    .action {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-top: 20rpx;

        .button {
            width: 180rpx;
            height: 60rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 20rpx;
            border-radius: 60rpx;
            border: 1rpx solid #ccc;
            font-size: 26rpx;
            color: #444;
        }

        .secondary {
            color: #27ba9b;
            border-color: #27ba9b;
        }

        .primary {
            color: #fff;
            background-color: #27ba9b;
        }
    }

    .loading-text {
        text-align: center;
        font-size: 28rpx;
        color: #666;
        padding: 20rpx 0;
    }
}
</style>
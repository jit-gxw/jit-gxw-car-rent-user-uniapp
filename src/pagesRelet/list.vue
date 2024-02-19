<script setup lang="ts">
import { ref } from 'vue'
import type { ReletSubmitType, ReletPageType, ReletPageReturnType, ReletType } from '@/types/relet.d'
import { SearchReletService, CancelReletService } from '@/services/relet'
import { onLoad } from '@dcloudio/uni-app'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
//预约列表
const reletData = ref<ReletType[]>([])
//分页数据
const pageData: Required<ReletPageType> = {
  page: 1,
  pageSize: 5,
}

//查询预约信息
const getReletData = async () => {

  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }

  await SearchReletService(pageData)
    .then((result) => {
      // 数组追加
      reletData.value.push(...result.data.records)
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
const DetialData = ref<ReletType>({
  order: {
    vehicleName: '',
    licensePlateNumber: ''
  }
} as ReletType)
// 页面加载
onLoad(() => {
  getReletData()
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
  reletData.value = []
  isFinish.value = false
  // 加载数据
  await getReletData()
  // 关闭动画
  isTriggered.value = false
}


//点击详情页
const popup = ref();
const detialHandle = (item: ReletType) => {
  DetialData.value = item
  popup.value.open()
}

//取消预约
const cancelHandel = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '是否取消续租？',
    showCancel: true,
    success: async ({ confirm }) => {
      if (confirm) {
        await CancelReletService(id)
          .then((result) => {
            onRefresherrefresh()
            uni.showToast({
              title: '取消成功！',
              icon: 'success',
              mask: true
            })
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
</script>





<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text class="item"> 全部续租信息 </text>

    </view>
    <!-- 滑动容器 -->
    <swiper class="swiper">
      <!-- 滑动项 -->
      <swiper-item>
        <!-- 订单列表 -->
        <scroll-view scroll-y class="orders" :refresher-triggered="isTriggered" refresher-enabled
          @refresherrefresh="onRefresherrefresh" @scrolltolower="getReletData">

          <view class="card" v-for="item in reletData" :key="item.id">
            <!-- 车辆信息 -->
            <view class="status">
              <text class="date">{{ item.reletTime }}</text>
              <!-- 订单状态文字 -->
              <text>{{ item.status === 0 ? '待审核' : item.status === 1 ? '已审核' : item.status === 2 ? '未通过' : '已取消' }}</text>

            </view>
            <!-- 商品信息，点击商品跳转到订单详情，不是商品详情 -->
            <view class="goods" hover-class="none" @tap="detialHandle(item)">


              <view class="meta">
                <view class="name ellipsis">订单号：{{ item.number }}</view>
                <view class="name ellipsis">{{ item.order.vehicleName }}</view>
                <view class="type">{{ item.order.licensePlateNumber }}</view>

              </view>

            </view>
            <!-- 预约信息 -->

            <view class="payment">
              <text class="quantity">申请还车时间：{{ item.returnTime }}</text>



            </view>
            <view>
              <text class="quantity" style="font-size: 24rpx;
              margin-left: 24rpx;" v-if="item.status != 0">处理时间：{{ item.cancelTime || item.passTime }}</text>
            </view>
            <!-- 订单操作按钮 -->
            <view class="action">
              <!-- 待付款状态：显示去支付按钮 -->
              <template v-if="item.status === 0">
                <view class="button primary" @tap="cancelHandel(item.id)">取消</view>
              </template>
            </view>
          </view>
          <!-- 底部提示文字 -->
          <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
            {{ true ? '没有更多数据~' : '正在加载...' }}
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>

  <!-- 详情页 -->
  <view>
    <uni-popup class="updatePopup" ref="popup" type="center">
      <uni-popup-dialog cancelText="返回" type="info" class="dialog" title="续租申请">
        <view class="context">
          <!-- 商品信息 -->
          <view class="goods">
            <view class="item">
              <view class="navigator" hover-class="none">
                <!-- <image class="cover" :src="DetialData.image">
                </image> -->
                <view class="meta">
                  <view class="name ellipsis">订单号{{ DetialData.number }}</view>
                  <view class="name ellipsis">{{ DetialData.order.vehicleName }}</view>
                  <view class="type">{{ DetialData.order.licensePlateNumber }}</view>
                  <view class="price">

                  </view>
                </view>
              </view>
              <!-- 状态:展示按钮 -->
              <view class="action" v-if="true">
                <view class="button primary">{{ DetialData.status === 0 ? '待审核' : DetialData.status
                  === 1 ? '已审核' : DetialData.status === 2 ? '未通过' : '已取消' }}</view>
              </view>
            </view>
            <!-- 合计 -->
            <view class="total">

              <view class="row">
                <view class="text">发起时间: </view>
                <view class="symbol">{{ DetialData.reletTime }}</view>
              </view>

              <view class="row">
                <view class="text">还车时间: </view>
                <view class="symbol">{{ DetialData.returnTime }}</view>
              </view>

              <view class="row">
                <view class="text">备注: </view>
                <view class="symbol">{{ DetialData.reletInfo }}</view>
              </view>

              <view class="row" v-if="DetialData.status === 2 || DetialData.status === 3">
                <view class="text">取消原因: </view>
                <view class="symbol">{{ DetialData.cancelReason }}</view>
              </view>

              <view class="row" v-if="DetialData.status === 2">
                <view class="text">不通过原因: </view>
                <view class="symbol">{{ DetialData.rejectionReason }}</view>
              </view>

              <view class="row" v-if="DetialData.status != 0">
                <view class="text">处理时间: </view>
                <view class="symbol">{{ DetialData.cancelTime || DetialData.passTime }}</view>
              </view>


            </view>
          </view>

        </view>



      </uni-popup-dialog>
    </uni-popup>

  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 20%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #27ba9b;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}

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
      height: 50rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 5rpx;
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

.dialog {
  .goods {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .item {
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;

      .navigator {
        display: flex;
        margin: 10rpx 0;
      }



      .meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
      }

      .name {
        height: 50rpx;
        font-size: 26rpx;
        color: #444;
      }

      .type {
        line-height: 1.8;
        padding: 0 15rpx;
        margin-top: 6rpx;
        font-size: 24rpx;
        align-self: flex-start;
        border-radius: 4rpx;
        color: #888;
        background-color: #f7f7f8;
      }

      .price {
        display: flex;
        margin-top: 6rpx;
        font-size: 24rpx;
      }

      .symbol {
        font-size: 20rpx;
      }

      .original {
        color: #999;
        text-decoration: line-through;
      }

      .actual {
        margin-left: 10rpx;
        color: #444;
      }

      .text {
        font-size: 22rpx;
      }

      .quantity {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 24rpx;
        color: #444;
      }

      .action {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-start;
        padding: 30rpx 0 0;


        .button {
          width: 200rpx;
          height: 60rpx;
          text-align: center;
          justify-content: center;
          line-height: 60rpx;
          margin-right: 120rpx;
          border-radius: 60rpx;
          border: 1rpx solid #ccc;
          font-size: 26rpx;
          color: #444;
        }

        .primary {
          color: #202020;
          border-color: #90a8a2;
        }
      }
    }

    .total {
      line-height: 1;
      font-size: 26rpx;
      padding: 20rpx 0;
      color: #666;

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10rpx 0;
      }

      .symbol::before {
        font-size: 80%;
        margin-right: 3rpx;
      }

      .primary {
        color: #cf4444;
        font-size: 36rpx;
      }
    }
  }

}
</style>
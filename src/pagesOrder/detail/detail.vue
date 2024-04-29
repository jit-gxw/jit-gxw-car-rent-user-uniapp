<script setup lang="ts">
import { ref } from 'vue'
import type { OrderPageType, OrderType } from '@/types/order'
import type { ReletSubmitType } from '@/types/relet.d'
import { CancelOrderService, DetailOrderService, PaymentOrderService,SubmitFaultService } from '@/services/order'
import { SubmitReletService } from '@/services/relet'
import { onLoad } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/index'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const query = defineProps<{
  id: number
}>()
//订单详情数据模型
const detailData = ref<OrderType>({} as OrderType)
//查询订单详情
const getDetailData = async () => {
  await DetailOrderService(query.id)
    .then((result) => {
      detailData.value = result.data
    })
}
//续租提交数据模型
const returnTime = ref()
const reletSubmitData = ref<ReletSubmitType>({} as ReletSubmitType)
//故障报修数据模型
const repairDetail=ref()
const faultSubmit=ref({
  vehicleId:"",
  information:""
})

// 页面加载
onLoad(() => {
  getDetailData()
})




//取消订单
const CancelHandel = () => {
  uni.showModal({
    title: '提示',
    content: '是否取消订单？',
    showCancel: true,
    success: async ({ confirm }) => {
      if (confirm) {
        //取消
        await CancelOrderService(detailData.value.id)
          .then((result) => {
            uni.showToast({
              title: '取消成功！',
              icon: 'success',
              mask: true
            })

            getDetailData()
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
const onOrderPay = async () => {
  await PaymentOrderService({ number: detailData.value.number })
    .then((result: any) => {
      uni.redirectTo({ url: `/pagesOrder/payment/payment?id=${query.id}` })
    }).catch((err: any) => {
      uni.showToast({ title: '支付失败', icon: 'error' })
    });
}
//发起续租
const popup = ref();
const ReletSubmit = () => {
  reletSubmitData.value.ordersId = detailData.value.id
  const returnTime = new Date(detailData.value.returnTime)

  const returnTimeTom = new Date()
  returnTimeTom.setHours(20, 0, 0, 0)

  returnTimeTom.setDate(returnTime.getDate() + 1)
  reletSubmitData.value.returnTime = formatDate(returnTimeTom)
  popup.value.open();
}
//故障报修
const popupRepair = ref();
const repairSubmit = () => {
  faultSubmit.value.vehicleId=detailData.value.vehicleId;
  faultSubmit.value.information=repairDetail.value
  popupRepair.value.open();
}
const submitRepairConfirm=async ()=>{
  await SubmitFaultService(faultSubmit.value)
}
//二次确认发起续租
const SubmitConfirm = async () => {
  await SubmitReletService(reletSubmitData.value)
    .then((result) => {
      uni.showToast({
        title: '提交成功！',
        icon: 'success',
        mask: true
      })
      setTimeout(() => {
        //页面跳转
        uni.redirectTo({ url: `/pagesRelet/list` })
      }, 500);
    }).catch((err: any) => {
      uni.showToast({
        title: err,
        icon: 'error',
        mask: true
      })
    })
}

</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <view class="wrap">
      <navigator v-if="true" open-type="navigateBack" class="back icon-left"></navigator>
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view>

  <scroll-view scroll-y class="viewport" id="scroller">
    <template v-if="true">
      <!-- 订单状态 -->
      <view class="overview" :style="{ paddingTop: safeAreaInsets!.top + 20 + 'px' }">
        <!-- 待付款状态:展示去支付按钮和倒计时 -->

        <template v-if="detailData.status === 4 || detailData.status === 0">
          <view class="status icon-clock">等待付款</view>
          <view class="tips">

            <text class="money">{{ detailData.status === 0 ? '应付押金' : '应付金额' }}: ¥
              {{ detailData.status === 0 ? detailData.cashPledge : detailData.amount }}</text>

          </view>
          <view class="button" @tap="onOrderPay">去支付</view>
        </template>


        <!-- 其他订单状态:展示再次购买按钮 -->
        <template v-else>
          <!-- 订单状态文字 -->
          <view class="status"> 订单详情 </view>

        </template>

      </view>
      <!-- 配送状态 -->
      <view class="shipment">
        <!-- 订单物流信息 -->
        <view v-for="item in 1" :key="item" class="item">
          <view class="message">
            取车时间：{{ detailData.collectionTime }}
          </view>
          <view class="message">
            还车时间：{{ detailData.returnTime }}
          </view>
        </view>

        <!-- 用户信息 -->
        <view class="locate">
          <view class="user"> {{ detailData.userName }} {{ detailData.phone }} </view>
          <view class="address"> 身份证： {{ detailData.idNumber }}</view>
          <view class="address"> 驾驶证： {{ detailData.licenceId }} </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <view class="item">
          <navigator class="navigator" hover-class="none">
            <image class="cover" :src="detailData.image"></image>
            <view class="meta">
              <view class="name ellipsis">{{ detailData.vehicleName }}</view>
              <view class="type">{{ detailData.licensePlateNumber }}</view>
              <view class="price">

              </view>

            </view>
          </navigator>
          <!-- 状态展示按钮 -->
          <view class="action" v-if="true">
            <view class="button primary">
              {{ detailData.status === 0 ? '待付押金'
                : detailData.status === 1 ? '待取车'
                  : detailData.status === 2 ? '租赁中'
                    : detailData.status === 3 ? '已还车'
                      : detailData.status === 4 ? '待付款'
                        : detailData.status === 5 ? '已完成'
                          : '已取消' }}
            </view>
          </view>
        </view>
        <!-- 合计 -->
        <view class="total">
          <view class="row">
            <view class="text">车辆押金: </view>
            <view class="symbol">{{ detailData.cashPledge }}</view>
          </view>
          <view class="row">
            <view class="text">额外费用: </view>
            <view class="symbol">{{ detailData.extraCharges }}</view>
          </view>
          <view class="row">
            <view class="text">订单总额: </view>
            <view class="symbol primary">{{ detailData.amount }}</view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ detailData.number }}
          </view>
          <view class="item">生成时间: {{ detailData.orderTime }}</view>

          <view class="item">有无续租: {{ detailData.reletStatus === 0 ? '无' : '有' }}</view>

          <view class="item">支付状态: {{ detailData.payStatus === 0 ? '未支付' : detailData.payStatus === 1 ? '已支付' : '退款' }}
          </view>

          <view class="item">押金状态: {{ detailData.cashPledgeStatus === 0 ? '未支付' : detailData.cashPledgeStatus === 1 ?
            '已支付' : '退款' }}
          </view>

          <view class="item" v-if="detailData.status === 6">取消时间: {{ detailData.cancelTime }}</view>

          <view class="item" v-if="detailData.status === 6">取消原因: {{ detailData.cancelReason }}</view>

          <view class="item">完成时间: {{ detailData.completionTime }}</view>

          <view class="item">备注: {{ detailData.remark }}</view>



        </view>
      </view>


      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"
        v-if="detailData.status === 0 || detailData.status === 1 || detailData.status === 2 || detailData.status === 4|| detailData.status === 3">
        <!-- 待付款状态:展示支付按钮 -->
        <template>
          <view class="button "
            v-if="(detailData.status === 0 || detailData.status === 1 || detailData.status === 2) && detailData.reletStatus === 0"
            @tap="ReletSubmit"> 申请续租
          </view>
          <view class="button "
            v-if="(detailData.status === 3||detailData.status === 2)"
            @tap="repairSubmit"> 故障报修
          </view>

          <view class="button primary" v-if="detailData.status === 0 || detailData.status === 4" @tap="onOrderPay"> 去支付
          </view>
          <view class="button" v-if="detailData.status === 0 || detailData.status === 1" @tap="CancelHandel"> 取消订单 </view>
        </template>
      </view>
    </template>
  </scroll-view>


  <view>
    <uni-popup class="updatePopup" ref="popup" type="center">
      <uni-popup-dialog cancelText="取消" type="success" confirmText="确认" class="dialog" title="续租申请"
        @confirm="SubmitConfirm">
        <view class="context">

          <view class="item">
            <text class="label">续租订单：</text>
            <text class="value">{{ detailData.number }}</text>
          </view>


          <view class="item">
            <text class="label">申请还车时间：</text>
            <view class="example-body">
              <uni-datetime-picker type="datetime" v-model="reletSubmitData.returnTime" :clear-icon="false"
                :start="detailData.returnTime" />
            </view>
          </view>

          <view class="item">
            <text class="label">备注：</text>
            <input class="input" type="text" placeholder="请填写续租信息" v-model="reletSubmitData.reletInfo" />
          </view>


        </view>



      </uni-popup-dialog>
    </uni-popup>

  </view>

  <view>
    <uni-popup class="updatePopup" ref="popupRepair" type="center">
      <uni-popup-dialog cancelText="取消" type="success" confirmText="确认" class="dialog" title="故障报修"
        @confirm="submitRepairConfirm">
        <view class="context">

          <view class="item">
            <text class="label">故障车辆：</text>
            <text class="value">{{ detailData.vehicleName }}</text>
          </view>
          <view class="item">
            <text class="label">车牌号码：</text>
            <text class="value">{{ detailData.licensePlateNumber }}</text>
          </view>

          <view class="item">
            <text class="label">故障信息：</text>
            <input class="input" type="text" placeholder="请填写故障信息" v-model="repairDetail" />
          </view>


        </view>



      </uni-popup-dialog>
    </uni-popup>

  </view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background-color: #f7f7f8;
}

.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://jit-gxw-web.oss-cn-nanjing.aliyuncs.com/EmployeeId:1::4bc050ff-9d3d-4fa2-aca2-8ea99a10554c.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://jit-gxw-web.oss-cn-nanjing.aliyuncs.com/EmployeeId:1::42f7f64a-757f-4479-abb8-7f3990e14629.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

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
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
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
        margin-left: 20rpx;
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
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}

.dialog {

  .context {

    .item {
      display: flex;
      line-height: 2;
      padding: 10rpx;
      font-size: 26rpx;
      color: #333;
      border-bottom: 1rpx dashed #ccc;
    }

    .label {
      width: 200rpx;
    }

    .value {
      flex: 1;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;

    }

    &:last-child {
      border: none;
    }

  }

  .example-body {
    background-color: #fff;
    padding: 10px;
  }


}
</style>
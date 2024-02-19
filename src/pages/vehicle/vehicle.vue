<script setup lang="ts">
import { ref, watch } from 'vue';
import { searchVehicleByIdService } from '@/services/vehicle'
import type { VehicleType } from '@/types/vehicle'
import type { AppointmentSubmitType } from '@/types/appointment'
import { SubmitAppointmentService } from "@/services/appointment";
import { onLoad } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/index'
import { useMemberStore } from '@/stores';
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

//日期
const today = new Date()
today.setHours(8, 0, 0, 0)
const datetimerange = ref<string[]>([])
// 接收页面参数
const query = defineProps<{
  id: number
  datetimerange: string
}>()
console.log(query);

//日期转换
const startDate = ref<Date>()
const endDate = ref<Date>()
//相差天数
const daysDifference = ref<number>(0)
//估算价格
const price = ref<number>()



// 获取车辆详情信息
const VehicleData = ref<VehicleType>({} as VehicleType)
//设置预计价格
const setPrice = () => {
  //计算相距天数
  startDate.value = new Date(datetimerange.value[0])
  endDate.value = new Date(datetimerange.value[1])
  daysDifference.value = Math.ceil((endDate.value.getTime() - startDate.value.getTime()) / (1000 * 60 * 60 * 24));
  //计算价格
  price.value = (Math.floor(daysDifference.value / 31) * VehicleData.value.priceMonth + Math.min(daysDifference.value % 31, 31) * VehicleData.value.priceDay)
}
//页面初始化方法
const getVehicleByIdData = async () => {
  await searchVehicleByIdService(query.id)
    .then((result) => {
      VehicleData.value = result.data
    })
  datetimerange.value = query.datetimerange.split(',')
  //计算价格
  setPrice()
}

// 页面加载
onLoad(() => {
  getVehicleByIdData()
})

watch(datetimerange, () => {
  setPrice();
});

//预约
const popup = ref();

const appointmentData = ref<AppointmentSubmitType>({} as AppointmentSubmitType)
const appointmentHandle = () => {
  const memberStore = useMemberStore()
  if (!memberStore.profile) {
    //判断是否登录
    uni.showToast({
      title: '请先登录！',
      icon: 'error',
      mask: true
    })
    setTimeout(() => {
      //页面跳转
      uni.navigateTo({ url: '/pages/login/login' })
    }, 500);
  } else if (
    //判断信息是否完整
    !memberStore.profile?.name
    || !memberStore.profile?.phone
    || !memberStore.profile?.idNumber
    || !memberStore.profile?.licenceId) {
    uni.showToast({
      title: '请先完善个人信息！',
      icon: 'error',
      mask: true
    })
    setTimeout(() => {
      //页面跳转
      uni.navigateTo({ url: '/pagesMember/profile/profile' })
    }, 500);
  } else {
    appointmentData.value.vehicleId = VehicleData.value.id,
      appointmentData.value.collectionTime = datetimerange.value[0],
      appointmentData.value.returnTime = datetimerange.value[1],
      //打开弹窗
      popup.value.open();
  }

}
//二次确认发起预约
const SubmitConfirm = async () => {
  await SubmitAppointmentService(appointmentData.value)
    .then((result) => {
      uni.showToast({
        title: '预约成功！',
        icon: 'success',
        mask: true
      })
      setTimeout(() => {
        //页面跳转
        uni.redirectTo({ url: `/pagesAppointment/list` })
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
  <scroll-view scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <swiper circular>
          <swiper-item>
            <image mode="aspectFill" :src="VehicleData?.image" />
          </swiper-item>

        </swiper>

      </view>

      <!-- 商品简介 -->
      <view class="meta">
        <view class="price">
          <text class="symbol">日租价格：¥</text>
          <text class="number">{{ VehicleData?.priceDay }}</text>
        </view>
        <view class="name ellipsis">{{ VehicleData?.name }} </view>
        <view class="desc"> {{ VehicleData?.classificationName }} </view>
      </view>

      <!-- 操作面板 -->
      <view class="action">
        <view class="item">
          <text class="label">日期</text>
          <uni-datetime-picker v-model="datetimerange" type="datetimerange" rangeSeparator="至" :clear-icon="false"
            :start="formatDate(today)" @change="setPrice" />
        </view>
        <view class="item">
          <text class="label">预计价格</text>
          <text class="value" :value="price">￥{{ price }}</text>
        </view>



      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="properties">
          <!-- 属性详情 -->
          <view class="item">
            <text class="label">名称</text>
            <text class="value">{{ VehicleData?.name }}</text>
          </view>

          <view class="item">
            <text class="label">类型</text>
            <text class="value">{{ VehicleData?.classificationName }}</text>
          </view>

          <view class="item">
            <text class="label">押金</text>
            <text class="value">￥{{ VehicleData?.cashPledge }}</text>
          </view>

          <view class="item">
            <text class="label">座位数</text>
            <text class="value">{{ VehicleData?.seating }}</text>
          </view>

          <view class="item">
            <text class="label">日租价格</text>
            <text class="value">￥{{ VehicleData?.priceDay }}</text>
          </view>

          <view class="item">
            <text class="label">月租价格</text>
            <text class="value">￥{{ VehicleData?.priceMonth }}</text>
          </view>

          <view class="item">
            <text class="label">描述</text>
            <text class="value">{{ VehicleData?.description }}</text>
          </view>




        </view>

      </view>
    </view>


  </scroll-view>

  <!-- 用户操作 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">

    <view class="buttons">

      <view class="buynow" @tap="appointmentHandle"> 立即预约 </view>
    </view>
  </view>


  <view>
    <uni-popup class="updatePopup" ref="popup" type="center">
      <uni-popup-dialog cancelText="取消" type="success" confirmText="确认" class="dialog" title="预约信息"
        @confirm="SubmitConfirm">
        <view class="context">

          <view class="item">
            <text class="label">预约汽车：</text>
            <text class="value">{{ VehicleData?.name }}</text>
          </view>

          <view class="item">
            <text class="label">取车时间：</text>
            <text class="value">{{ datetimerange[0] }}</text>
          </view>

          <view class="item">
            <text class="label">还车时间：</text>
            <text class="value">{{ datetimerange[1] }}</text>
          </view>

          <view class="item">
            <text class="label">预计价格：</text>
            <text class="value">￥{{ price }}</text>
          </view>

          <view class="item">
            <text class="label">备注：</text>
            <input class="input" type="text" placeholder="请填写预约信息" v-model="appointmentData.appointmentInfo" />
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
  display: flex;
  flex-direction: column;
}

.viewport {
  background-color: #f4f4f4;
}

.panel {
  margin-top: 20rpx;
  background-color: #fff;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90rpx;
    line-height: 1;
    padding: 30rpx 60rpx 30rpx 6rpx;
    position: relative;

    text {
      padding-left: 10rpx;
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      border-left: 4rpx solid #27ba9b;
    }

    navigator {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.arrow {
  &::after {
    position: absolute;
    top: 50%;
    right: 30rpx;
    content: '\e6c2';
    color: #ccc;
    font-family: 'erabbit' !important;
    font-size: 32rpx;
    transform: translateY(-50%);
  }
}

/* 商品信息 */
.goods {
  background-color: #fff;

  .preview {
    height: 750rpx;
    position: relative;

    .image {
      width: auto;
      height: 750rpx;
    }

    .indicator {
      height: 40rpx;
      padding: 0 24rpx;
      line-height: 40rpx;
      border-radius: 30rpx;
      color: #fff;
      font-family: Arial, Helvetica, sans-serif;
      background-color: rgba(0, 0, 0, 0.3);
      position: absolute;
      bottom: 30rpx;
      right: 30rpx;

      .current {
        font-size: 26rpx;
      }

      .split {
        font-size: 24rpx;
        margin: 0 1rpx 0 2rpx;
      }

      .total {
        font-size: 24rpx;
      }
    }
  }

  .meta {
    position: relative;
    border-bottom: 1rpx solid #eaeaea;

    .price {
      height: 130rpx;
      padding: 25rpx 30rpx 0;
      color: #fff;
      font-size: 34rpx;
      box-sizing: border-box;
      background-color: #35c8a9;
    }

    .number {
      font-size: 56rpx;
    }

    .brand {
      width: 160rpx;
      height: 80rpx;
      overflow: hidden;
      position: absolute;
      top: 26rpx;
      right: 30rpx;
    }

    .name {
      max-height: 88rpx;
      line-height: 1.4;
      margin: 20rpx;
      font-size: 32rpx;
      color: #333;
    }

    .desc {
      line-height: 1;
      padding: 0 20rpx 30rpx;
      font-size: 24rpx;
      color: #cf4444;
    }
  }

  .action {
    padding-left: 20rpx;

    .item {
      height: 90rpx;
      padding-right: 60rpx;
      border-bottom: 1rpx solid #eaeaea;
      font-size: 26rpx;
      color: #333;
      position: relative;
      display: flex;
      align-items: center;

      &:last-child {
        border-bottom: 0 none;
      }
    }

    .label {
      width: 130rpx;
      color: #898b94;
      margin: 0 16rpx 0 10rpx;
    }

    .text {
      flex: 1;
      -webkit-line-clamp: 1;
    }
  }
}

/* 商品详情 */
.detail {
  padding-left: 20rpx;
  padding-bottom: 200rpx;

  .content {
    margin-left: -20rpx;

    .image {
      width: 100%;
    }
  }

  .properties {
    padding: 0 20rpx;
    margin-bottom: 30rpx;

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
  }
}

/* 同类推荐 */
.similar {
  .content {
    padding: 0 20rpx 200rpx;
    background-color: #f4f4f4;
    display: flex;
    flex-wrap: wrap;

    .goods {
      width: 340rpx;
      padding: 24rpx 20rpx 20rpx;
      margin: 20rpx 7rpx;
      border-radius: 10rpx;
      background-color: #fff;
    }

    .image {
      width: 300rpx;
      height: 260rpx;
    }

    .name {
      height: 80rpx;
      margin: 10rpx 0;
      font-size: 26rpx;
      color: #262626;
    }

    .price {
      line-height: 1;
      font-size: 20rpx;
      color: #cf4444;
    }

    .number {
      font-size: 26rpx;
      margin-left: 2rpx;
    }
  }

  navigator {
    &:nth-child(even) {
      margin-right: 0;
    }
  }
}

/* 底部工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: #fff;
  height: 100rpx;
  padding: 0 20rpx var(--window-bottom);
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;

  .buttons {
    display: flex;

    &>view {
      width: 220rpx;
      text-align: center;
      line-height: 72rpx;
      font-size: 26rpx;
      color: #fff;
      border-radius: 72rpx;
    }

    .addcart {
      background-color: #ffa868;
    }

    .buynow,
    .payment {
      background-color: #27ba9b;
      margin-left: 220rpx;
    }
  }

  .icons {
    padding-right: 10rpx;
    display: flex;
    align-items: center;
    flex: 1;

    .icons-button {
      flex: 1;
      text-align: center;
      line-height: 1.4;
      padding: 0;
      margin: 0;
      border-radius: 0;
      font-size: 20rpx;
      color: #333;
      background-color: #fff;

      &::after {
        border: none;
      }
    }

    text {
      display: block;
      font-size: 34rpx;
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



}
</style>
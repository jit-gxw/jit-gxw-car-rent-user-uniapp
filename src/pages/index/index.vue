<script setup lang="ts">
import { ref } from 'vue';
import type { ClassificationType } from '@/types/classification'
import { searchClassificationService } from '@/services/classification'
import type { PageVehicleType, VehicleType } from '@/types/vehicle'
import { searchVehicleService } from '@/services/vehicle'
import { onLoad } from '@dcloudio/uni-app';
import { formatDate } from '@/utils/index'
/* -------------------------------------------初始化数据模型 */
//日期范围 明天时间-后一天
const today = new Date()
today.setHours(8, 0, 0, 0)
const tomorrow = new Date()
tomorrow.setHours(8, 0, 0, 0)
tomorrow.setDate(today.getDate() + 1)
const afterTomorrow = new Date()
afterTomorrow.setHours(20, 0, 0, 0)
afterTomorrow.setDate(tomorrow.getDate() + 1)
const datetimerange = ref([formatDate(tomorrow), formatDate(afterTomorrow)])
//分类数据模型
const classificationData = ref<ClassificationType[]>([])
//分类索引
const activeIndex = ref(0)
//车辆数据模型
const vehicleData = ref<VehicleType[]>([])
//分页查询数据模型
const pageQueryData = ref<PageVehicleType>({} as PageVehicleType)
/* ----------------------------------方法 */
//获取分类数据
const getClassificationData = async () => {
  const res = await searchClassificationService()
  classificationData.value = res.data
  getVehicleData(0)
}
// 页面加载
onLoad(async () => {
  await Promise.all([getClassificationData()])
})
//列表获取车辆数据
const getVehicleData = async (index: number) => {
  if (datetimerange.value[0] === undefined || datetimerange.value[1] === undefined) {
    datetimerange.value[0] = formatDate(today),
      datetimerange.value[1] = formatDate(tomorrow)
  }
  activeIndex.value = index
  pageQueryData.value.begin = datetimerange.value[0]
  pageQueryData.value.end = datetimerange.value[1]
  pageQueryData.value.classificationId = classificationData.value[index].id
  await searchVehicleService(pageQueryData.value)
    .then((result) => {
      vehicleData.value = result.data

    })
}

//时间选择器获取车辆数据
const getVehicleDataForTime = async () => {

  pageQueryData.value.begin = datetimerange.value[0]
  pageQueryData.value.end = datetimerange.value[1]
  await searchVehicleService(pageQueryData.value)
    .then((result) => {
      vehicleData.value = result.data
    })
}
</script>

<template>
  <view class="viewport">

    <!-- 搜索框 -->
    <view class="search">

      <uni-section title="选择租赁日期：" type="line"></uni-section>
      <view class="example-body">
        <uni-datetime-picker v-model="datetimerange" type="datetimerange" rangeSeparator="至"
          @change="getVehicleDataForTime" :clear-icon="false" :start="formatDate(today)" />
      </view>
    </view>

    <!-- 分类 -->
    <view class="categories">

      <!-- 左侧：一级分类 -->
      <scroll-view class="primary" scroll-y>
        <view v-for="(item, index) in classificationData" :key="item.id" class="item"
          :class="{ active: index === activeIndex }" @tap="getVehicleData(index)">
          <text class="name"> {{ item.name }} </text>
        </view>
      </scroll-view>


      <scroll-view class="secondary" scroll-y>

        <!-- 内容区域 -->
        <view class="panel">



          <view class="section">
            <navigator v-for="car in vehicleData" :key="car.id" class="goods" hover-class="none"
              :url="`/pages/vehicle/vehicle?id=${car.id}` + `&datetimerange=` + datetimerange">
              <image class="image" :src="car.image"></image>
              <view class="name ellipsis">{{ car.name }}</view>
              <view class="price">
                <text class="symbol">日租价格：¥</text>
                <text class="number">{{ car.priceDay }}</text>
              </view>
            </navigator>
          </view>

        </view>


      </scroll-view>
    </view>
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
}

.search {
  padding: 0 30rpx 20rpx;
  background-color: #fff;

  .input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64rpx;
    width: 180rpx;
    padding-left: 26rpx;
    color: #8b8b8b;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: #f3f4f4;
  }

  .example-body {
    background-color: #fff;
    padding: 10px;
  }
}

.icon-search {
  &::before {
    margin-right: 10rpx;
  }
}

/* 分类 */
.categories {
  flex: 1;
  min-height: 400rpx;
  display: flex;
}

/* 一级分类 */
.primary {
  overflow: hidden;
  width: 180rpx;
  flex: none;
  background-color: #f6f6f6;

  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 96rpx;
    font-size: 26rpx;
    color: #595c63;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 42rpx;
      bottom: 0;
      width: 96rpx;
      border-top: 1rpx solid #e3e4e7;
    }
  }

  .active {
    background-color: #fff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8rpx;
      height: 100%;
      background-color: #27ba9b;
    }
  }
}

.primary .item:last-child::after,
.primary .active::after {
  display: none;
}

/* 二级分类 */
.secondary {
  background-color: #fff;

  .carousel {
    height: 200rpx;
    margin: 0 30rpx 20rpx;
    border-radius: 4rpx;
    overflow: hidden;
  }

  .panel {
    margin: 0 30rpx 0rpx;
  }

  .title {
    height: 60rpx;
    line-height: 60rpx;
    color: #333;
    font-size: 28rpx;
    border-bottom: 1rpx solid #f7f7f8;

    .more {
      float: right;
      padding-left: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .more {
    &::after {
      font-family: 'erabbit' !important;
      content: '\e6c2';
    }
  }

  .section {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;

    .goods {
      width: 235rpx;
      margin: 0rpx 0rpx 10rpx 20rpx;

      &:nth-child(3n) {
        margin-right: 0;
      }

      image {
        width: 200rpx;
        height: 200rpx;
      }

      .name {
        padding: 5rpx;
        font-size: 22rpx;
        color: #333;
      }

      .price {
        padding: 5rpx;
        font-size: 18rpx;
        color: #cf4444;
      }

      .number {
        font-size: 24rpx;
        margin-left: 2rpx;
      }
    }
  }
}
</style>
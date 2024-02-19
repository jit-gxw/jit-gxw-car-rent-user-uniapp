<script setup lang="ts">
import { useMemberStore } from '@/stores';


const memberStore = useMemberStore()
//退出登录
const onLogout = () => {
  uni.showModal({
    title: '提示',
    content: '是否退出登录？',
    showCancel: true,
    success: ({ confirm, cancel }) => {
      if (confirm) {
        // 这里放置确认退出登录的逻辑
        memberStore.clearProfile()
        uni.navigateBack({ delta: 1 })
        console.log('用户确认退出');
      } else if (cancel) {
        // 这里放置取消退出的逻辑
        console.log('用户取消退出');
      }
    }
  })
}
</script>

<template>
  <view class="viewport">
    <!-- 列表1 -->
    <view class="list">
      <navigator url="/pagesMember/personInfo" hover-class="none" class="item arrow">
        个人信息
      </navigator>
    </view>
    <!-- 操作按钮 -->
    <view class="action">
      <view @tap="onLogout" class="button">退出登录</view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  padding: 20rpx;
}

/* 列表 */
.list {
  padding: 0 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  border-radius: 10rpx;

  .item {
    line-height: 90rpx;
    padding-left: 10rpx;
    font-size: 30rpx;
    color: #333;
    border-top: 1rpx solid #ddd;
    position: relative;
    text-align: left;
    border-radius: 0;
    background-color: #fff;

    &::after {
      width: auto;
      height: auto;
      left: auto;
      border: none;
    }

    &:first-child {
      border: none;
    }

    &::after {
      right: 5rpx;
    }
  }

  .arrow::after {
    content: '\e6c2';
    position: absolute;
    top: 50%;
    color: #ccc;
    font-family: 'erabbit' !important;
    font-size: 32rpx;
    transform: translateY(-50%);
  }
}

/* 操作按钮 */
.action {
  text-align: center;
  line-height: 90rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
  color: #333;

  .button {
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
  }
}
</style>
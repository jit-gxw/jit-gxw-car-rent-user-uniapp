<script setup lang="ts">
import { searchInfoService, updatePersonInfoService } from '@/services/user';
import { useMemberStore } from '@/stores';
import type { PersonInfo } from '@/types/member';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
//获取个人信息
const PersonInfoData = ref<PersonInfo>({} as PersonInfo)
const getPersonInfo = async () => {
  const res = await searchInfoService()
  PersonInfoData.value = res.data
}
const memberStore = useMemberStore()
onLoad(() => {
  getPersonInfo()
})
//修改头像
const onAvatarChange = () => {
  //调用拍照或选择图片
  uni.chooseMedia({
    //文件数量
    count: 1,
    //文件类型
    mediaType: ['image'],
    success: (res) => {
      //本地路径
      const { tempFilePath } = res.tempFiles[0]
      //文件上传
      uni.uploadFile({
        url: '/user/common/upload',
        fileType: 'image',
        filePath: tempFilePath,
        name: 'file',
        success: (res) => {
          if (res.statusCode === 200) {
            PersonInfoData.value!.avatar = JSON.parse(res.data).data
            uni.showToast({
              icon: 'success',
              title: '更新成功'
            })

          } else {
            uni.showToast({
              icon: 'error',
              title: '出现错误'
            })
          }
        }
      })
    }
  })
}
//修改性别
const onSexChange: UniHelper.RadioGroupOnChange = (ev) => {
  PersonInfoData.value.sex = ev.detail.value
}

/* ----------------------校验规则 */
const rules = {
  name: {
    rules: [{ required: true, errorMessage: "请输入姓名" }],
  },
  idNumber: {
    rules: [
      { required: true, errorMessage: "请输入身份证号" },
      { pattern: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/, errorMessage: '身份证号格式不正确' },
    ],
  },
  phone: {
    rules: [
      { required: true, errorMessage: "请输入手机号" },
      { pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  licenceId: {
    rules: [
      { required: true, errorMessage: "请输入驾驶证号" },
      { pattern: /^[0-9]{12}$/, errorMessage: '驾驶证格式不正确' }
    ],
  },
}


//表单组件实例
const formRef = ref()
//提交表单 更新个人信息
const onSubmit = async () => {
  try {
    //校验规则
    await formRef.value?.validate?.()

    updatePersonInfoService({
      name: PersonInfoData.value!.name,
      phone: PersonInfoData.value!.phone,
      sex: PersonInfoData.value!.sex,
      idNumber: PersonInfoData.value!.idNumber,
      licenceId: PersonInfoData.value!.licenceId,
      avatar: PersonInfoData.value!.avatar,
    })
    //更新Store
    memberStore.profile!.name = PersonInfoData.value!.name
    memberStore.profile!.phone = PersonInfoData.value!.phone
    memberStore.profile!.sex = PersonInfoData.value!.sex
    memberStore.profile!.idNumber = PersonInfoData.value!.idNumber
    memberStore.profile!.licenceId = PersonInfoData.value!.licenceId
    memberStore.profile!.avatar = PersonInfoData.value!.avatar
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    });
    setTimeout(() => {
      uni.navigateBack()
    }, 400)

  } catch (error) {
    uni.showToast({
      icon: 'error',
      title: '请正确填写每项数据'
    })
  }


}

</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view @tap="onAvatarChange" class="avatar-content">
        <image class="image" :src="PersonInfoData?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <for class="form">
      <!-- 表单内容 -->
      <uni-forms :rules="rules" class="form-content" :model="PersonInfoData" ref="formRef">

        <uni-forms-item name="name" class="form-item">
          <text class="label">姓名</text>
          <input class="input" placeholder="请填写本人姓名" v-model="PersonInfoData.name" />
        </uni-forms-item>

        <uni-forms-item name="idNumber" class="form-item">
          <text class="label">身份证号</text>
          <input class="input" type="text" placeholder="请填写身份证号" v-model="PersonInfoData.idNumber" />
        </uni-forms-item>

        <uni-forms-item name="phone" class="form-item">
          <text class="label">手机号码</text>
          <input class="input" type="text" placeholder="请填写手机号码" v-model="PersonInfoData.phone" />
        </uni-forms-item>

        <uni-forms-item name="licenceId" class="form-item">
          <text class="label">驾驶证号码</text>
          <input class="input" type="text" placeholder="请填写驾驶证号码" v-model="PersonInfoData.licenceId" />
        </uni-forms-item>

        <uni-forms-item name="sex" class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onSexChange">
            <label class="radio">
              <radio value="1" color="#27ba9b" :checked="PersonInfoData?.sex === '1'" />
              男
            </label>
            <label class="radio">
              <radio value="0" color="#27ba9b" :checked="PersonInfoData?.sex === '0'" />
              女
            </label>
          </radio-group>
        </uni-forms-item>


      </uni-forms>
      <!-- 提交按钮 -->
      <button @tap="onSubmit" class="form-button">保 存</button>
    </for>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 60rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>
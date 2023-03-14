// pages/store_operation_up/store_operation_up.js
const db = wx.cloud.database()
const clothesIcon = '/image/clothes.png'
const eatingIcon = '/image/eating.png'
const defaultIcon = '/image/default.png'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    img:[],
    submitted:false,
    openId:"",
    shop:{},
    types:[],
    index:-1
  },
  // 上传图片
  upload_img:function(){
    let that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        const tempFilePaths = res.tempFiles[0].tempFilePath;
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        console.log("当前时间戳为：" + timestamp);
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        wx.cloud.uploadFile({
          cloudPath: 'shop/'+timestamp+'.png',
          filePath: tempFilePaths, // 文件路径
          success: function(res) {
            // get resource ID
            console.log(res.fileID)
            that.setData({
              img:that.data.img.concat(res.fileID)
            })
          },
          // fail: function(res) {
          //   // handle error
          // }
        })
      }
    })
  },

  // 删除图片
  // 删除数组中指定下标
  delete: function (e) {
    let that = this
    console.log(that.data.img)
    console.log(e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id;
    var img= that.data.img;
    img.splice(id,1)
    that.setData({
      img: img
    })
    wx.cloud.deleteFile({
      fileList: [e.currentTarget.dataset.src],
      success: res => {
        // handle success
        console.log(res.fileList)
      },
      fail: err => {
        // handle error
      },
    })
    console.log(that.data.img)
  },
  
  submit:function(e){
    let that = this
    console.log(e)
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    if(e.detail.value.name!==""&&e.detail.value.address!==""&&e.detail.value.phone!==""
    &&e.detail.value.longitude!==""&&e.detail.value.latitude!==""&&e.detail.value.type!==""
    &&that.data.img.length!=0){
      const type = e.detail.value.type;
      let iconPath = defaultIcon;
      if(type==="服装"){
         iconPath = clothesIcon;
      }else if(type==="餐饮"){
        iconPath = eatingIcon;
      }
      db.collection('apply_shop').add({
        data:{
          name:e.detail.value.name,
          address:e.detail.value.address,
          longitude:e.detail.value.longitude,
          latitude:e.detail.value.latitude,
          notice:e.detail.value.notice,
          src:that.data.img,
          phone:e.detail.value.phone,
          num:0,
          markerId:timestamp,
          category:[],
          type:e.detail.value.type,
          iconPath:iconPath
        },success:function(res){
          wx.showToast({
            duration:1000,
            title: '提交成功',
          success: () => {
            setTimeout(() => {
              wx.navigateBack(
              )}, 1000)  
            }
          })
        }
      })
    }else{
      wx.showToast({
        title: '你还有未填信息',
        icon:"none"
      })
    }
  },

  checkboxChange(e){
    const index = Number(e.detail.value);
    this.setData({
      index
    })

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户的openid，在apply_shop中查找是否有，改变submitted的值
    let that = this;
    let openId = "";
    let user = wx.getStorageSync('user');
    db.collection('apply_shop').where({
      _openid: user._openid,
    }).get({
      success: function(res) {
        if(res.data[0].num===0){
          that.setData({
            submitted:true
          })
        }
      },
      complete:function(res){
        that.showTip()
      }
    })
    // 获取分类栏目
    db.collection('type').get({
      success:function(res){
        console.log(res);
        const types = res.data[0].type;
        that.setData({
          types
        })
      }
    })
    // 提示用户收集信息的用途
    wx.showModal({
      title: '提示',
      content: '您填写的信息将被被填入您的店铺，用于显示在地图页，请确定是否继续填写',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    })
  },

  showTip(){
    if(this.data.submitted){
      wx.showModal({
        title: '提示',
        content: '您的申请在审核中',
        complete (res) {
            wx.navigateBack({
              delta: 1,
            })
          }
        })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this
    wx.redirectTo({
      url: '../store_operation_up/store_operation_up',
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
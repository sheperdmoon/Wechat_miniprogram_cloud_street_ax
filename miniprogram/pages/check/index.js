const db = wx.cloud.database()

// pages/check/index.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    apply_shop:[],
    duration:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
   
  },

  pass(e){
    let that =this;
    wx.showModal({
      title: '提示',
      content: '是否通过',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          wx.showModal({
            title: '请输入duration',
            content: '',
            placeholderText:"(30天为单位)",
            editable:true,
            success (res) {
              const duration = Number(res.content);
              that.setData({
                duration
              })
              if (res.confirm) {
                that.pass_now(e);
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  pass_now(e){
    const index = e.currentTarget.dataset.index;
    const open_id = this.data.apply_shop[index]._openid;
    const id = this.data.apply_shop[index]._id;
    var timestamp = Date.parse(new Date());
    timestamp = timestamp/1000;
    let that = this;
    db.collection('apply_shop').where({
      _openid:open_id,
      _id:id
    }).update({
        data: {
          num:1,
          due:timestamp,
          duration:that.data.duration
        },
        success: function(res) {
          that.onShow();
        }
      })
    //通过open_id索引 修改用户表单中的openShop变为1
      db.collection('user').where({
        _openid: open_id,
      }).update({
        data: {
          openShop:1
        }
    })
  },

  fail(e){
    let that =this;
    wx.showModal({
      title: '提示',
      content: '是否驳回',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          that.fail_now(e);
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  
  
  fail_now(e){
    const index = e.currentTarget.dataset.index;
    const open_id = this.data.apply_shop[index]._openid;
    const id = this.data.apply_shop[index]._id;
    let that = this;
    db.collection('apply_shop').where({
      _openid:open_id,
      _id:id
    }).remove({
      success: function(res) {
        that.onShow();
      }
    })
      // 之后可以提示用户 您的申请被驳回，原因是：。。。
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
    let that = this
    db.collection('apply_shop').count({
      success:function(res){
                let apply_shop = []
                console.log(res.total);
                let batch = Math.ceil((res.total)/20);
                console.log(batch);
                for(let i=0;i<batch;i++){
                    db.collection('apply_shop').skip(i*20).get({
                      success:function(res){
                        console.log('申请表单获取成功',res)
                        // wx.setStorageSync('apply_shop', res.data)
                        // const apply_shop = wx.getStorageSync('apply_shop')
                        let apply_shop1 = res.data.filter(v=>v.num===0);
                        console.log(apply_shop1);
                        apply_shop = apply_shop.concat(apply_shop1)
                        that.setData({
                          apply_shop
                        })
                      },
                      fail:function(res){
                        console.log('分类获取失败',res)
                      },
                    })
                  }
                }
    })
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
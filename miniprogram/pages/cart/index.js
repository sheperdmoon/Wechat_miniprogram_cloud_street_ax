// pages/cart/index.js
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cart:[],
    openId:"",
  },

  onLoad(){
    console.log("cart--on--load");
  },

  back_to_product(){
     if(this.data.productInfo){
        const productInfo = this.data.productInfo;
        wx.navigateTo({
          url: '/pages/goods_detail/index?shopId='+productInfo.shopId+'&&category='+productInfo.categoryIndex+
          '&&index='+productInfo.index,
        })
        wx.removeStorageSync('productInfo')
        this.setData({
          productInfo:{}
        })
    }
  },

  onShow(){
    // 
    let user = wx.getStorageSync('user');
    const productInfo = wx.getStorageSync('productInfo');
    this.setData({
      cart:user.cart,
      productInfo
    })
  },
    
    
  delete(e){
    let that=this;
    wx.showModal({
      title: '提示',
      content: '确定删除',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          that.delete_now(e);
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },

  delete_now(e){
    let user = wx.getStorageSync('user');
    let that=this;
    const index = e.currentTarget.dataset.indexdelete;
    let cart = this.data.cart;
    cart.splice(index,1);
    this.setData({
      cart
    })
    db.collection('user').where({
      _openid: user._openid,
    }).update({
      data:{
        cart:cart
      },
      success:function(res){
          user.cart = cart;
          wx.setStorageSync('user', user);
          wx.showToast({
            title: '删除成功',
          })
          that.onShow()
        },
    })
  },

    locate(e){
      const index = e.currentTarget.dataset.indexcheck;
      // 将商品的clothInfo的shopId传参给新打开的cartMap页
      const shopId = this.data.cart[index].clothInfo.shopId;
      wx.setStorageSync('cart_shopId', shopId);
      wx.switchTab({
        url: '/pages/index/index',
      })

    },
      /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

 
})
// pages/goods_detail/index.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product:{},
    clothInfo:{},
    openId:"",
    pics:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const product = wx.getStorageSync("product").data;
    // const time = wx.getStorageSync('product').time;
    // if(!product){
    //   this.getCloth(options);
    // }
    // else{  
    //   if(Date.now()-time>1000*10){
    //     this.getCloth(options);
    //   }
    //   else{
    //     this.setData({
    //       product
    //     })
    //   }
    // }
    this.getCloth(options);//因为同一个商品一般是不会频繁打开关闭的，所以默认是打开一个就请求一次
  },

  getCloth(options){
    // 云数据库get到具体的商品数据，加入缓存，然后将数据保存到data（效仿shop)
    let that = this;
    let shopId = Number(options.shopId); //传参默认是string
    let categoryIndex = options.category;
    let index = options.index;
    let clothInfo = {
      shopId:shopId,
      categoryIndex:categoryIndex,
      index:index
    }
    this.setData({
      clothInfo
    })
    db.collection('apply_shop').where({
      markerId:shopId
    }).get({
      success:function(res){
        console.log(res);
        const shop = res.data[0];
        const category = shop.category[categoryIndex];
        console.log(categoryIndex);
        console.log(category);
        const cloth = shop[category][index];
        console.log(cloth);
        let product = {
          first_img:cloth.first_img,
          img:cloth.img,
          name:cloth.name,
          price:cloth.price,
          intro:cloth.intro
        };
        let pics = []
        pics.push(product.first_img[0])
        for(let i=0;i<Math.min(2,product.img.length);i++){
          pics.push(product.img[i]);
        }
        console.log(product);
        that.setData({
          product,
          pics
        })
      }
    })


  },

  handlePreviewImage(e){
    const {index} = e.currentTarget.dataset;
    const urls = this.data.pics;
    wx.previewImage({
      current: urls[index], // 当前显示图片的 http 链接
      urls: urls // 需要预览的图片 http 链接列表
    })
  },
  
  handleCartAdd(){
    let that = this;
    let user = wx.getStorageSync('user');
    if(user){
        let cart = user.cart;
        let cartItem = {
          clothInfo:that.data.clothInfo,
          product:that.data.product
        }
          let yes=false;
          for(let i=0;i<cart.length;i++){
            if(cart[i].clothInfo.categoryIndex===cartItem.clothInfo.categoryIndex&&
              cart[i].clothInfo.index===cartItem.clothInfo.index&&
              cart[i].clothInfo.shopId===cartItem.clothInfo.shopId)
            yes=true;
          }
          if(yes){ // 已在购物车中
            wx.showToast({
              title: '已在购物车中',
            })
          }else{  // 不在购物车中,就加入云cart，然后本地user更新。
                cart.push(cartItem);
                db.collection('user').where({
                  _openid: user._openid,
                }).update({
                  data:{
                      cart:cart
                  },// 本地更新
                  success:function(res){
                      user.cart = cart;
                      wx.setStorageSync('user', user);
                    wx.showToast({
                      title: '加入成功',
                    })
                  }
                })
            }
    }else{
      wx.showModal({
        title: '提示',
        content: '请先前往‘我的’页面进行注册,之后可加入购物车',
        success (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/index',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  look_for_cart(){
    // 将此商品的参数储存，给cart页面的返回按钮使用
    wx.setStorageSync('productInfo', this.data.clothInfo);
    wx.switchTab({
      url: '/pages/cart/index',
    })
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

  },
  onShareTimeline(){
    
  }
})
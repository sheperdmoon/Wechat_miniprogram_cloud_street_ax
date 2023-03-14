const db = wx.cloud.database()
const shop1 = {
  id: 100,
  latitude: 25.054857773439767,
  longitude: 118.18826962921904,
  iconPath: '/image/default.png',
  width:25,
  height:25,
  callout: {
    content: '伊莱美女装',
    color: '#ff0000',
    fontSize: 14,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#000000',
    bgColor: '#fff',
    padding: 5,
    display: 'ALWAYS',
    textAlign: 'center'
  },
}
const shop2 = {
  id: 101,
  latitude: 25.054080228418094,
  longitude: 118.1867675921707,
  iconPath: '/image/default.png',
  width:25,
  height:25,
  callout: {
    content: '安踏童装',
    color: '#ff0000',
    fontSize: 14,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#000000',
    bgColor: '#fff',
    padding: 5,
    display: 'ALWAYS',
    textAlign: 'center'
  },
}

const callout = {
    content: '',
    color: '#ff0000',
    fontSize: 14,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#000000',
    bgColor: '#fff',
    padding: 5,
    display: 'ALWAYS',
    textAlign: 'center'
}
  

Page({
  data: {
    latitude: 25.05544,
    // latitude: 24.944960346997874,
    // longitude: 118.152453351593,

    longitude: 118.18685,
    d_latitude:25.05544,
    d_longitude:118.18685,
    markers: [],
    onAll:true,
    onSave:false,
    mode:1,
    cart_shopId:0
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },

  onLoad(){
    const user = wx.getStorageSync('user');
    this.setData({
      longitude:user.longitude,
      latitude:user.latitude,
    })
    if(user.remind===1){
      this.goOn(user._openid);
    }
    wx.setStorageSync('openTime', Date.now());
    this.getShops();
  },

  getShops(){
    // 先计算出数据总量，然后分patch请求
    var batch = 0;
    let that = this;
    db.collection('apply_shop').count({
      success:function(res){
        console.log(res.total);
        batch = Math.ceil((res.total)/20);
        let markers = []
        // markers.push(shop1);
        // markers.push(shop2);
        const mode = that.data.mode;
        // 先设定好地图的中心，根据mode，
        if(mode!=3){  // 如果不是看单个商品的话，就以默认定位为中心
            const user = wx.getStorageSync('user');
            // this.setData({
            //   longitude:user.longitude,
            //   latitude:user.latitude,
            // })//有必要移动吗？？？
            // wx.createMapContext("myMap", this).moveToLocation({   
            //   longitude:user.longitude,
            //   latitude:user.latitude,
            // })
        }
        // 从云数据库apply_shop get到所有店铺，filter出num为1的，然后循环该数组，填充到marker里
        let total_shop = [];
        console.log(batch);
        for(let i =0;i<batch;i++){
              console.log("now");
              let marker_shop = []
              db.collection('apply_shop').skip(i*20).get({
                success:function(res){
                console.log("www");
                  console.log('申请表单获取成功',res)
                  if(mode===1){
                    marker_shop = res.data.filter(v=>v.num===1);
                  }
                  if(mode===2){
                    const saves = wx.getStorageSync('user').saves;
                    console.log(saves);
                    for(let i=0;i<res.data.length;i++){
                      if(saves.includes(res.data[i].markerId)){
                        marker_shop.push(res.data[i]);
                      }
                    }
                    console.log(marker_shop);
                  }
                  if(mode===3){
                    marker_shop = res.data.filter(v=>v.markerId===that.data.cart_shopId);
                    wx.createMapContext("myMap", this).moveToLocation({   
                      longitude:marker_shop[0].longitude,
                      latitude:marker_shop[0].latitude,
                    })
                    // that.setData({
                    //   longitude:marker_shop[0].longitude,
                    //   latitude:marker_shop[0].latitude,
                    // })
                  }
                  console.log(marker_shop);
                  for(let i=0;i<marker_shop.length;i++){
                      let calloutNow = {
                        content: '',
                        color: '#ff0000',
                        fontSize: 14,
                        borderWidth: 2,
                        borderRadius: 10,
                        borderColor: '#000000',
                        bgColor: '#fff',
                        padding: 5,
                        display: 'ALWAYS',
                        textAlign: 'center'
                      }
                      
                      calloutNow.content = marker_shop[i].name; 
                  
                      markers.push({
                        id :marker_shop[i].markerId,
                        longitude : marker_shop[i].longitude,
                        latitude :marker_shop[i].latitude,
                        iconPath : marker_shop[i].iconPath,
                        callout : calloutNow,
                        width:25,
                        height:25
                        })
                  }
                  that.setData({
                    markers
                  })
                
                },
                fail:function(res){
                  console.log('marker获取失败',res)
                }
            })
            
            
          }
         
      }
    })
  

  },

  openSave(){
    const user=wx.getStorageSync('user')
    if(user){
      this.setData({
        onAll:false,
        onSave:true,
        mode:2
      })
      this.getShops();
    }else{
      wx.showModal({
        title: '提示',
        content: '请先前往‘我的’页面进行注册,之后可查看我的收藏',
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

  openAll(){
    this.setData({
      onAll:true,
      onSave:false,
      mode:1
    })
    this.getShops();
  },


  onShow(){
    let cart_shopId = wx.getStorageSync('cart_shopId');
    if(cart_shopId){
      this.setData({
        onAll:false,
        onSave:true,
        cart_shopId,
        mode:3
      })
      wx.removeStorageSync('cart_shopId');
      this.getShops();
    }else{
        let timeNow = wx.getStorageSync('openTime');
        if(Date.now()-timeNow>30*1000){
          this.getShops();
        }
        wx.setStorageSync('openTime', Date.now())
    }
  },

  back_default_location(){
    const user = wx.getStorageSync('user');
    if(user){
    wx.createMapContext("myMap", this).moveToLocation({   
      longitude:user.longitude,
      latitude:user.latitude,
    })
  } else{
    wx.showModal({
      title: '提示',
      content: '请先前往‘我的’页面进行注册,之后可在主页修改默认定位',
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

  choose_Location(){
    let that = this;
    wx.chooseLocation({
      success:function(res){
        console.log("yes");
        console.log(res.longitude);
        console.log(res.latitude);
        wx.createMapContext("myMap", this).moveToLocation({   
          latitude: res.latitude,
          longitude: res.longitude
      })
      }
    })
    this.onShow()
  },

  goOn(openId){
    let user = wx.getStorageSync('user');
    let goOn = 2;
    wx.showModal({
      title: '您的店铺已到期',
      content: '是否继续入驻',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          wx.showToast({
            title: '请联系开发者',
          })
          goOn = 0;
          db.collection('apply_shop').where({
            _openid:openId
          }).update({
                data:{
                  num:goOn
                }
          })
          db.collection('user').where({
              _openid: openId,
            }).update({
              data:{
                remind:0
              },
              success:function(res){
                user.remind=0;
                wx.setStorageSync('user', user);
              }
            })
          
        } else {//这里是点击了取消以后
          wx.showModal({
            title: '提示',
            content: '确定终止合作',
            success: function (res) {
              if (res.confirm) {//这里是点击了确定以后
                goOn = 2;
                db.collection('user').where({
                  _openid: openId,
                }).update({
                    data:{
                      remind:0
                    },
                    success:function(res){
                      user.remind=0;
                      wx.setStorageSync('user', user);
                    }
                })
              } else {//这里是点击了取消以后
                console.log('用户点击取消')
                goOn = 1;//代表再考虑一下一下
              }
            }
          })
          console.log('用户点击取消')
        }
      }
    })
    return goOn;
  },

  callouttap(e) {
    let shop_id = e.detail.markerId;
    wx.navigateTo({
      url: '/pages/shop/index?shopId='+shop_id,
    })
    console.log(e);
  },

  onPullDownRefresh(){
    this.onLoad();
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onShareTimeline(){

  },
})

const db = wx.cloud.database()

Page({
  data: {
    isAdmin:false,
    isUser:false,
    isShoper:false,
    user: {},
    hasUserInfo: false,
  },
  tidy_shop(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.page,
    })
  },

  apply_for_shop(e){
      wx.navigateTo({
        url: e.currentTarget.dataset.page,
      })
    },

    change_type(e){
      wx.navigateTo({
        url: e.currentTarget.dataset.page,
      })
    },


    check_for_apply(e){
      // 遍历所有商家，将过期的num置为2，并且索引到商户，将其openshop置为0，remind置为1
      db.collection('apply_shop').count({
        success:function(res){
                  console.log(res.total);
                  let batch = Math.ceil((res.total)/20);
                  for(let i=0;i<batch;i++){
                    let ids=[]
                      db.collection('apply_shop').skip(i*20).get({
                        success:function(res){
                                console.log("hh");
                                console.log(res);
                                let shops = res.data;
                                for(let i=0;i<shops.length;i++){
                                  const due = shops[i].due;
                                  const duration = shops[i].duration;
                                  console.log(Date.now());
                                  console.log(due);
                                  //如果超时了 并且 其是在注册的商家
                                  if((Date.now()/1000-due)>duration*24*60*60 && shops[i].num===1){
                                    console.log("got it");
                                    if(shops[i]._openid)
                                      ids.push(shops[i]._openid);
                                  }
                                }
                                    console.log("ids",ids);
                                for(let i=0;i<ids.length;i++){
                                      db.collection('apply_shop').where({
                                        _openid:ids[i]
                                      }).update({
                                        data:{
                                          num:2,
                                        },
                                        success:function(res){
                                          console.log("update success");
                                        }
                                      })
                                      db.collection('user').where({
                                        _openid:ids[i]
                                      }).update({
                                            data:{
                                            openShop:1,
                                            remind:1
                                            }
                                        })
                                }
                              }
                      })
            }
          }
    })
      wx.navigateTo({
        url: e.currentTarget.dataset.page,
      })
    },

    open_save_map(e){
      wx.navigateTo({
        url: '/pages/save/index',
      })
    },
    
    onLoad() {
      // 这边写个云函数获取openId，从而在用户表单里索引，进而将userInfo填充，以及isAdmin
      const user = wx.getStorageSync('user')
      // if(!user){
      //   // console.log(this.data.openId);
      //   this.getUser();
      // }else{
      if(user){
          this.setData({
              user:user,
              hasUserInfo:true
          })
      }
    },

    change_location(){
      let that = this;
      let user = wx.getStorageSync('user');
      wx.chooseLocation({
        success:function(res){
          const longitude = res.longitude;
          const latitude = res.latitude;
          db.collection('user').where({
            _openid: user._openid,
          }).update({
              data:{
              longitude:longitude,
              latitude:latitude
              },
              success:function(res){
                user.longitude = longitude;
                user.latitude = latitude;
                wx.setStorageSync('user');
                console.log("这是update");
                console.log(res);
                wx.showToast({
                  title: '默认定位成功',
                })
              }
            })
        }
       })
    },

    getUser(){
      let that = this;
      let openId = "";
      wx.cloud.callFunction({
        name: 'getOpenId',
        complete: res => {
          openId = res.result.openid
          db.collection('user').where({
            _openid: openId,
          }).get({
            success: function(res) {
              console.log(res);
              if(res.data.length!=0){
                    that.setData({
                      user:res.data[0],
                      hasUserInfo:true
                    })
              }
              wx.setStorageSync('user', res.data[0])
            },
          })
        }
      })

    },

    getUserProfile(e) {
      // 推荐使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称
      let that =this;
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res);
          let power = 0;
          let gender = res.userInfo.gender;
          const user = {
            name: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl,
            power:power,
            openShop:0,
            saves:[],
            cart:[],
            remind:0,
            latitude: 25.05544,
            longitude: 118.18685,
          }  
          wx.setStorageSync('user', user);
          that.setData({
            user,
            hasUserInfo: true
          })
          db.collection('user').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                  name: res.userInfo.nickName,
                  avatar: res.userInfo.avatarUrl,
                  power:power,
                  openShop:0,
                  saves:[],
                  latitude: 25.05544,
                  longitude: 118.18685,
                  cart:[],
                  remind:0
              },
              success: function(res) {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                console.log(res)
              }
            })
            },    
      })
    },
    onShow(){
    },
    onPullDownRefresh: function () {
      this.getUser();
    },
      /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
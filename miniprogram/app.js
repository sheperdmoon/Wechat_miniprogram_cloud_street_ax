// app.js

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }
    const db = wx.cloud.database()

    this.globalData = {};
    this.getUser(db);
  },

  getUser(db){
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
              console.log("成功");
              wx.setStorageSync('user', res.data[0]);   
            }
          },
        })
      }
    })

  },
  // 每次由后台切换到前台，就重新请求一次数据。
  onShow:function(){ 
    console.log("后台切换到前台，重新获取user数据");
    const db = wx.cloud.database()
    this.globalData = {};
    this.getUser(db);
  },


});

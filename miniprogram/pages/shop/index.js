const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    leftMenu:[],
    rightContent:[],
    // wholeContent:[],
    currentIndex:0,
    scrollTop:0,
    shopId:0, //商家的Id,
    isSave:false,
    userId:"",
    shop:{},
    mode:0
  },
  cateList:[],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    // 现在要整合删除和正常的页面。
    // 注意是不同商家，所以尽管要缓存一家店铺的数据，防止反复进入请求，但是要先判断shopid
    const shopId = Number(options.shopId);
    const mode = Number(options.mode);
    this.setData({
      shopId,
      mode
    })
    console.log("shop-----onload");
    const shopIdBefore = wx.getStorageSync('shopId');
    if(shopIdBefore===shopId){
        const leftMenu = wx.getStorageSync("leftMenu").data;
        const time = wx.getStorageSync('leftMenu').time;
        const rightContent = wx.getStorageSync('rightContent');
        const shop = wx.getStorageSync('shop');
        const isSave = wx.getStorageSync('isSave');
        if(Date.now()-time>1000*15){
          this.getCates(shopId);
          console.log("重新云端");
        }
        else{
          console.log("按照本地");
          this.setData({
            leftMenu,
            rightContent:rightContent[0],
            shop,
            isSave,
          })
      }
    }else{
      this.getCates(shopId);
    }
  },
// 访问云数据库，得到商品的分类条目，并且遍历商品条目，将其分好类, 进行缓存
  getCates(shopId){
    let that = this;
    wx.setStorageSync('shopId', Number(shopId));
    // 先通过shop_id找到商家,获取数据
    db.collection('apply_shop').where({
        markerId:shopId
    }).get({
      success:function(res){
        console.log("渲染"+res);
        that.setData({
          leftMenu:res.data[0].category
        })
        wx.setStorageSync("leftMenu", {time:Date.now(),data:that.data.leftMenu})
        // 获取具体商品数据，需要循环
        const leftMenu = res.data[0].category;
        let rightContent=[]
        for(let i=0;i<leftMenu.length;i++){
            const typeNow = res.data[0][leftMenu[i]]
            rightContent.push(typeNow)
        }
        that.setData({
          rightContent:rightContent[0]
        })
        wx.setStorageSync('rightContent', rightContent)
        const shopNow = res.data[0];
        let shop = {
          name:shopNow.name,
          phone:shopNow.phone,
          notice:shopNow.notice
        }
        that.setData({
          shop
        })
        console.log("now"+shop);
        wx.setStorageSync('shop', shop)
      },
        fail:function(res){
          console.log('分类获取失败',res)
        }
      })

     // 看看user有没有收藏该家店铺
    const user = wx.getStorageSync('user');
    if(user.saves.includes(that.data.shopId)){
          that.setData({
            isSave:true
          })
        wx.setStorageSync('isSave', true);
    }
  },

  handleItemTap(e){
    console.log(e);
    const {index} = e.currentTarget.dataset;
    const rightContent = wx.getStorageSync('rightContent');
    this.setData({
      currentIndex:index
    })
    this.setData({
      rightContent:rightContent[index],
      scrollTop:0
    })
  },

  haveSave(){
      let that = this;
      let then = !this.data.isSave;
      let user = wx.getStorageSync('user'); 
      if(user){
        let saves = user.saves;
        if(then===false){
          saves = saves.filter(v => v != that.data.shopId)
          wx.setStorageSync('isSave', false)
        }else{
          if(!saves.includes(that.data.shopId)){
            saves.push(that.data.shopId)
          }
          wx.setStorageSync('isSave', true)
        }
        db.collection('user').where({
          _openid: user._openid,
        }).update({
          data:{
            saves:saves
          },
          success:function(res){
            user.saves = saves;
            wx.setStorageSync('user', user);
          }
        })
        that.setData({
          isSave:then
        })
      } else{
        wx.showModal({
          title: '提示',
          content: '请先前往‘我的’页面进行注册,之后可进行店铺收藏',
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

  deleteCloth(e){
      console.log(e);
      // 通过传参，获取索引，进而直接在里面删除，注意要先弹窗示意
      let that = this;
      wx.showModal({
        title: '提示',
        content: '是否删除',
        success: function (res) {
          if (res.confirm) {//这里是点击了确定以后
            that.delete_now(e.currentTarget.dataset.index);
          } else {//这里是点击了取消以后
            console.log('用户点击取消')
          }
        }
      })
  },
  
    // 先通过rightContent知道当前要删除的衣服的分类，然后找到分类数组，进行某项的删除，再更新
  delete_now(e){
      let that=this;
      const index = e;
      const shopId = this.data.shopId;
      const cloth = this.data.rightContent[index];
      const cate = cloth.category;
      console.log(cate);
      db.collection('apply_shop').where({
        markerId:shopId
      }).get({ //这个get可以省略，直接用rightcontent代替即可
         success:function(res){
            console.log(res);
            let clothes = res.data[0][cate];
            clothes.splice(index,1);
            db.collection('apply_shop').where({
              markerId:shopId
            }).update({
              data:{
                [[cate]]:clothes
              },
              success:function(res){
                 console.log(clothes);
                  wx.showToast({
                    duration:1000,
                    title: '删除成功'
                  })
                  that.getCates(shopId)
              }
            })
           
        }
      })
    },

  changeCloth(e){
    let that=this;
    const index = e.currentTarget.dataset.index;
    const shopId = this.data.shopId;
    const cloth = this.data.rightContent[index];
    console.log(cloth);
    const cate = cloth.category;
    console.log(cate);
    db.collection('apply_shop').where({
      markerId:shopId
    }).get({ //这个get可以省略，直接用rightcontent代替即可
       success:function(res){
          console.log(res);
          let clothes = res.data[0][cate][index];
          wx.navigateTo({
            url: '/pages/update/index?index='+index+'&&clothes='+JSON.stringify(clothes),
          })
         
      }
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
    if(this.data.mode===1){
      this.getCates(this.data.shopId);
    }
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
    this.getCates(this.data.shopId);

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
    
  },
})
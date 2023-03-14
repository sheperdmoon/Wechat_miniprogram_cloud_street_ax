// pages/tidy/index.js
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cateInput:"",
    category:[],
    openId:"",
    index:-1,
    notice:"",
    content:"",
    checkeds:[],
    shopId:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
// 加载的时候，就可以判断data_shop里面有无数据，无的话就需要先注册一下，
     console.log("tidy------onload");
      let that = this;
      let openId = "";
      const user = wx.getStorageSync('user');
      db.collection('apply_shop').where({
        _openid: user._openid,
      }).get({
        success:function(res){            
                console.log(res);
                that.setData({
                  category:res.data[0].category,
                  notice:res.data[0].notice,
                  shopId:res.data[0].markerId
                })
                let checkeds = []
                for(let i=0;i<that.data.category.length;i++){
                    checkeds.push(false);
                }
                that.setData({
                    checkeds
                })
                console.log(success);

        }
        })
  },

  bindCateInput: function (e) {
    this.setData({
      cateInput:e.detail.value
    })
  },

  addCate(){
    // 思路，根据云函数获取penid，据此get到data_shop里面的商铺，然后获取到category条目，其为一个数组，进行数组的增加，
    // 注意此条目可能不存在,所以可能得||[]
    console.log("add");
    if(this.data.cateInput===""||this.data.category.includes(this.data.cateInput)){
      wx.showToast({
        title: '分类名空或重复',
      })
    }else{
    const user = wx.getStorageSync('user');
    let that = this;
    let openId = user._openid;
    let category = this.data.category;
    console.log(category);
    category.push(this.data.cateInput);
    console.log(category);
    db.collection('apply_shop').where({
      _openid: openId,
        }).update({
            data:{
              category:category
            },
            success: function(res) {
              console.log("success");
              let checkeds = that.data.checkeds;
              checkeds.push(false)
              that.setData({
                category,
                content:"",
                cateInput:"",
                checkeds
              })
              console.log(res);
            }
          });
    }
  },

  check(){ //先看看当前index的值为true，还是false，然后全都置false，为false，就将index置为true
    console.log("check");
    let checkeds = this.data.checkeds;
    let clicked = checkeds[this.data.index];
    const index = this.data.index
    checkeds = checkeds.map(v=>v=false);
    if(clicked===false){
      checkeds[index]=true;
    }
    this.setData({
      checkeds
    })
  },

  deleteCate(){
     let that = this
     if(this.data.index>=this.data.category.length || this.data.index===-1){
          wx.showToast({
            title: '请选择分类',
          })
     }else{
        wx.showModal({
          title: '提示',
          content: '删除分类会一并删除该分类下的衣服,是否继续',
          success: function (res) {
            if (res.confirm) {//这里是点击了确定以后
              that.delete_now();
            } else {//这里是点击了取消以后
              console.log('用户点击取消')
            }
          }
        })
    }
  },

  delete_now(){
    // 通过复选框的bind事件获取到选中的index，然后直接将data中的category删去这些index，再云端更新和data更新
    const index = this.data.index;
    let category = this.data.category;
    let that = this;
    const user = wx.getStorageSync('user');
    let openId = user._openid;
    let theCate = category[index];
    category.splice(index,1);
    db.collection('apply_shop').where({
      _openid: openId,
        }).update({
            data:{
              category:category,
              [[theCate]]:_.remove()
            },
            success: function(res) {
              console.log("delete");
              that.setData({
                category
              })
              console.log(res);
              // that.onLoad()
            }
          });

  },

  checkboxChange(e){
    let index = e.detail.value;
    this.setData({
      index
    })
  },

  updateNotice(e){
      let that = this;
      let openId = this.data.openId;
      const notice = e.detail.value;
      db.collection('apply_shop').where({
        _openid: openId,
          }).update({
              data:{
                notice:notice
              },
              success: function(res) {
                that.setData({
                  notice
                })
                console.log(res);
              }
            });
  },

  updateGood(){
      // 跳转到商品上传页面，如果可以传参就好了，因为是要将服装的数据上传到data_shop，所以需要openid索引
      wx.navigateTo({
        url: '/pages/update/index',
      })

  },

  deleteGood(){
    wx.navigateTo({
      url: '/pages/shop/index?shopId='+this.data.shopId+'&&mode=1',
      success:function(res){
        console.log("yes");
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
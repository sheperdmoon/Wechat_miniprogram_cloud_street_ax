// pages/type/index.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[],
    cateInput:"",
    index:-1,
    content:"",
    checkeds:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    db.collection('type').get({
      success:function(res){
        let types = res.data[0].type;
        that.setData({
          types
        });
        let checkeds = []
        for(let i=0;i<types.length;i++){
            checkeds.push(false);
        }
        that.setData({
            checkeds
        })
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
    if(this.data.cateInput===""||this.data.types.includes(this.data.cateInput)){
      wx.showToast({
        title: '分类名空或重复',
      })
    }else{
    let that = this;
    let types = this.data.types;
    types.push(this.data.cateInput);
    console.log(types);
    db.collection('type').doc('0ab5303b62d7ade90f490ca80fad8400').update({
            data:{
              type:types
            },
            success: function(res) {
              console.log("success");
              let checkeds = that.data.checkeds;
              checkeds.push(false)
              that.setData({
                types,
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
     if(this.data.index>=this.data.types.length || this.data.index===-1){
          wx.showToast({
            title: '请选择分类',
          })
     }else{
        wx.showModal({
          title: '提示',
          content:'确定删除该类目',
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
    let types = this.data.types;
    let that = this;
    types.splice(index,1);
    db.collection('type').doc('0ab5303b62d7ade90f490ca80fad8400').update({
            data:{
               type:types
            },
            success: function(res) {
              console.log("delete");
              that.setData({
                types,
              })
              console.log(res);
              that.onLoad()
            }
          });

  },

  checkboxChange(e){
    let index = e.detail.value;
    this.setData({
      index
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
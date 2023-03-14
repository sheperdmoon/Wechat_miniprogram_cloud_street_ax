// pages/store_operation_up/store_operation_up.js
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    category:[],
    img:[],
    first_img:[],
    canAddMore:true,
    canAddMore2:true,
    clothes:{},
    showCate:true,
    cloudDelete:[],
    cloudUpdate:[],
    submitted:false,
    index:-1
  },
 // 上传示意图
  upload_first_img:function(){
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
              first_img:that.data.first_img.concat(res.fileID),
              canAddMore:false
            })// 将发布的图片src都记下来
            let cloudUpdate = that.data.cloudUpdate;
            cloudUpdate.push(res.fileId);
            that.setData({
              cloudUpdate
            })
          },
          // fail: function(res) {
          //   // handle error
          // }
        })
      }
    })
  },
  // 删除示意图
  delete_first_img: function (e) {
    let that = this
    console.log(that.data.img)
    console.log(e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id;
    var first_img= that.data.first_img;
    let cloudDelete = that.data.cloudDelete;
    cloudDelete.push(first_img[0]);
    that.setData({
      cloudDelete
    })
    first_img.splice(id,1)
    that.setData({
      first_img: first_img,
      canAddMore:true
    })
    
    // wx.cloud.deleteFile({
    //   fileList: [e.currentTarget.dataset.src],
    //   success: res => {
    //     // handle success
    //     console.log(res.fileList)
    //   },
    //   fail: err => {
    //     // handle error
    //   },
    // })
  },
  
   // 上传图片
   upload_img:function(){
    let that = this
    wx.chooseMedia({
      count: 5,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
          for(let i=0;i<res.tempFiles.length;i++){
              const tempFilePaths = res.tempFiles[i].tempFilePath;
              // 放个延时函数
              let timestamp =0;
              setTimeout(function(){
                timestamp=Date.now()+i;
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
                      let cloudUpdate = that.data.cloudUpdate;
                      cloudUpdate.push(res.fileID);
                      that.setData({
                        cloudUpdate
                      })
                      // if(that.data.img.length===5){
                      //   that.setData({
                      //     canAddMore2:false
                      //   })
                      // }
                    },
                    // fail: function(res) {
                    //   // handle error
                    // }
                  })
              },0);
                
            }
      }
    })
  },

  // 删除图片
  delete: function (e) {
    let that = this
    console.log(that.data.img)
    console.log(e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id;
    var img= that.data.img;
    let cloudDelete = that.data.cloudDelete;
    cloudDelete.push(img[id]);
    that.setData({
      cloudDelete
    })
    img.splice(id,1)
    that.setData({
      img: img
    })
    if(that.data.img.length<5){
      that.setData({
        canAddMore2:true
      })
    }
    // wx.cloud.deleteFile({
    //   fileList: [e.currentTarget.dataset.src],
    //   success: res => {
    //     // handle success
    //     console.log(res.fileList)
    //   },
    //   fail: err => {
    //     // handle error
    //   },
    // })
    // console.log(that.data.img)
  },


// 提交商家上新的产品到云数据库
  submit:function(e){
    const openId = wx.getStorageSync('user')._openid;
    if(this.data.showCate===true){
      let that = this
      console.log(e)
      if(e.detail.value.name!==""&& e.detail.value.price!==""
      &&e.detail.value.category!==""
      &&that.data.img.length!==0 && that.data.first_img.length!==0){
        this.setData({
            submitted:true
        })
        wx.cloud.deleteFile({
                fileList: this.data.cloudDelete,
                success: res => {
                  // handle success
                  console.log(res.fileList)
                },
                fail: err => {
                  // handle error
                },
              })
        let cloth = {
          name:e.detail.value.name,
          price:e.detail.value.price,
          category:e.detail.value.category,
          intro:e.detail.value.intro,
          first_img:that.data.first_img,
          img:that.data.img,
        }
        db.collection('apply_shop').where({
          _openid:openId
        }).update({
          data:{
            [[cloth.category]]:_.push(cloth)
          },success:function(res){
            wx.showToast({
              duration:1000,
              title: '上新成功',
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
    }else{ // 如果是要更新,需要要更新的商品的cate和index
              let that = this
              console.log(e)
              if(e.detail.value.name!==""&& e.detail.value.price!==""
              &&that.data.img.length!==0 && that.data.first_img.length!==0){
                this.setData({
                  submitted:true
                })
                wx.cloud.deleteFile({
                        fileList: this.data.cloudDelete,
                        success: res => {
                          // handle success
                          console.log(res.fileList)
                        },
                        fail: err => {
                          // handle error
                        },
                      })
                let cloth = {
                  name:e.detail.value.name,
                  price:e.detail.value.price,
                  category:this.data.clothes.category,
                  intro:e.detail.value.intro,
                  first_img:that.data.first_img,
                  img:that.data.img,
                }
                db.collection('apply_shop').where({
                  _openid:openId
                }).get({
                    success:function(res){
                      let cateNow = res.data[0][cloth.category];
                      cateNow[that.data.index]=cloth;
                      db.collection('apply_shop').where({
                        _openid:openId
                      }).update({
                        data:{
                        [[cloth.category]]:cateNow
                        },
                        success:function(res){
                          wx.showToast({
                            duration:1000,
                            title: '更新成功',
                          success: () => {
                            setTimeout(() => {
                              wx.navigateBack(
                              )}, 1000)  
                            }
                          })
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
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("这是参数");
    console.log(options);
    if(JSON.stringify(options)!="{}"){
        let clothes = JSON.parse(options.clothes)
        console.log(clothes);
        if(clothes.img.length===5){
          this.setData({
            canAddMore2:false
          })
        }
        this.setData({
          clothes,
          showCate:false,
          first_img:clothes.first_img,
          img:clothes.img,
          canAddMore:false,
          index:options.index
        })
    }
    let that = this
    const user = wx.getStorageSync('user')
    const openId = user._openid;
    console.log(openId);
    db.collection('apply_shop').where({
      _openid:openId
    }).get({
      success:function(res){
        console.log('分类获取成功',res)
        that.setData({
          category:res.data[0].category
        })
        console.log(this.data.category);
      },fail:function(res){
        console.log('分类获取失败',res)
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
    // 在这里将cloudUpdate的数据云端删掉
    if(this.data.submitted===false){
      wx.cloud.deleteFile({
        fileList: this.data.cloudUpdate,
        success: res => {
          // handle success
          console.log(res.fileList)
        },
        fail: err => {
          // handle error
        },
      })
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // let that = this
    // wx.redirectTo({
    //   url: '../update/index',
    // })
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
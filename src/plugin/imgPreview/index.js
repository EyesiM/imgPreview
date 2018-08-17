// import '../style/image-preview.styl'
import util from './util'
import dom from './dom'
import ic from './img-controls'
import keyboard from "./keyboard"
import { mouseWheel, filterOptions, fmtImageArray, appendIconfontToHead } from './fn'

// window.util = util

// 默认配置参数
const __DEFAULT = {
  // 背景遮罩透明度[0-1]
  // backgroundOpacity: .6,
  // 分页mouseover切换图片
  paginationable: true,
  // 显示关闭按钮
  showClose: true,
  // 显示上一张/下一张箭头
  showSwitchArrow: true,
  // 显示工具栏
  showToolbar: true,
  // 显示分页导航栏
  showPagination: true,
  // 缩放
  scalable: true,
  // 旋转
  rotatable: true,
  // 移动
  movable: true,
  // 按键配置
  keyboard: {
    prev: 'left',
    next: 'right',
    // 滚动鼠标[放大，缩小]
    scale: 'mousewheel',
    // [Clockwise 顺时针, anticlockwise 逆时针]
    rotate: ['up', 'down'],
    close: 'escape'
  },
  // 图标字体
  // iconfont: '//at.alicdn.com/t/font_613889_qd2ugx65fxadzpvi.css'
  iconfont: './src/assets/fonts/iconfont.css'
}

// const log = console.log

const Z_INDEX = 9999

class ZxImageView {
  constructor (opts, arr) {
    if (typeof arr === 'undefined' && util.isArray(opts)) {
      arr = opts
      opts = undefined
    }
    // 初始化参数
    let options = util.isObject(opts) ? util.assign(__DEFAULT, opts) : __DEFAULT
    // 判断键名配置是否有重复的
    this.opts = filterOptions(options)
    // 图片数组
    this.images = []
    this._init()
    if (util.isArray(arr)) {
      this.init(arr, 0)
    }
  }

  // 内部初始化
  _init () {
    const opts = this.opts
    // log(opts)
    // 预览容器dom结构对象
    const vnode = {
      tag: 'div',
      attrs: {
        class: 'preview-img',
        style: 'visibility: hidden'
      },
      child: []
    }
    // 显示关闭按钮
    if(opts.showClose) {
      vnode.child.push({
        tag: 'div', 
        attrs: {
          class: 'toolbar-header'
        }, 
        child: [{
          tag: 'span', 
          attrs: {
            class: 'view-close'
          },
          child: [
            {
              tag: 'i',
              attrs: {
                class: 'iconfont icon-guanbi',
                title: '关闭'
              }
            }
          ]
        }]
      })
    }
    // if(opts.showImg) {
      // 预览图片
      vnode.child.push({
          tag: 'div',
          attrs: {
            class: 'target-contain v-transition'
          },
          child: [{
            tag: 'img',
            attrs: {
              class: 'targetImg v-transition'
            }
          }]
        })
    // }
    // 显示左右箭头
    if (opts.showSwitchArrow) {
      // 左右方向箭头
      vnode.child[1].child.push({tag: 'div', attrs: {class: 'iconfont icon-shangyizhang pre-arrow'}})
      vnode.child[1].child.push({tag: 'div', attrs: {class: 'iconfont icon-xiayizhang next-arrow'}})
    }
    // 分页栏
    if (opts.showPagination) {
      vnode.child.push({tag: 'div', attrs: {class: 'preview-img-list'}})
    }
    // 工具栏
    if (opts.showToolbar) {
      vnode.child.push({
        tag: 'div',
        attrs: {
          class: 'toolbar-footer'
        },
        child: [
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-iconfont25',
                  title: '放大'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-magnify',
                  title: '缩小'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-youxuanzhuan',
                  title: '旋转'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-shangyizhang',
                  title: '上一张'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-xiayizhang',
                  title: '下一张'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-xiazai',
                  title: '下载'
                }
              }
            ]
          },
          {
            tag: 'span',
            attrs: {
              class: '_item'
            },
            child: [
              {
                tag: 'i',
                attrs: {
                  class: 'iconfont icon-yulan-PC',
                  title: '下载'
                }
              }
            ]
          }
        ]
      })
    }

    // 创建dom结构
    // 预览容器
    this.$container = dom.create(vnode)
    // 关闭按钮
    this.$close = dom.query('.view-close', this.$container)
    // 预览图片
    this.$img = dom.query('.targetImg', this.$container)
    this.$imgContainer =  dom.query('.target-contain', this.$container)
    // 分页栏
    this.$pagination = dom.query('.preview-img-list', this.$container)
    // 工具栏
    this.$tool = dom.query('.toolbar-footer', this.$container)
    // 背景透明度
    if (typeof opts.backgroundOpacity !== 'undefined') {
      const bo = util.toNumber(opts.backgroundOpacity)
      this.$container.style.background = `rgba(0, 0, 0, ${bo})`
    }

    // preview是否显示
    this.isPreview = false
    // 是否添加到body
    this.isAppendToBody = dom.appendToBody(this.$container)
    this.index = 0
    // 事件处理器
    this._eventHandler()
    // 添加图标字体样式至head
    appendIconfontToHead(dom, opts.iconfont)
  }

  // 初始化
  init (images, index) {
    if (!this.isAppendToBody) {
      this.isAppendToBody = dom.appendToBody(this.$container)
    }
    // 初始化数据
    let imgArray = fmtImageArray(images)
    if (imgArray) {
      this.images = imgArray
    }
    if (typeof index !== 'undefined') {
      this.index = index >= this.images.length ? 0 : util.int(index)
    }
    this._resetPaginationInnerHtml()
    this._resetCurrent$img()
  }

  /**
   * 更新当前图片数组
   * @param images
   */
  update (images) {
    this.init(images, 0)
  }

  // 重置分页html结构
  _resetPaginationInnerHtml () {
    if (!this.$pagination) return
    let html = ''
    let len = this.images.length
    this.images.forEach((item, index) => {
      // html += `<i style="width:${Math.floor(1 / len * 100)}%" data-index="${index}" class="_item${this.index === index ? ' _item-active' : ''}"></i>`
      html += `<span style="display:inline-block;background-image: url(${item.url});background-size: cover;" data-index="${index}" src="${item.url}" class="_item${this.index === index ? ' _item-active' : ''}"></span>`
    })
    this.$pagination.innerHTML = html
    this._checkArrowPrevNext()
  }

  /**
   * 查看图片
   * @param index 当前图片在数组中的索引
   * @param angle 旋转角度
   * @param images 图片数组
   */
  view (index = 0, angle, images) {
    // 参数验证
    if (typeof angle !== 'undefined') {
      if (util.isArray(angle) && typeof images === 'undefined') {
        images = angle
        angle = null
      }
    }
    let imgArray = fmtImageArray(images)
    if (imgArray) {
      this.images = imgArray
      this._resetPaginationInnerHtml()
    }
    // 图片数组是否有元素判断
    if (this.images.length === 0) {
      throw new Error(`图片数组images参数为空或格式不正确!`)
    }
    if (index < this.images.length) {
      this.index = util.int(index)
    }
    this._resetCurrent$img(angle, true)
    this.show()
    // 修改Pagination样式
    this._changePaginationClass()
  }

  // 销毁对象
  destroy () {
    try {
      this.$container.parentNode.removeChild(this.$container)
      this.$container = null
    } catch (e) {}
  }

  /**
   * 重置当前被预览的图片
   * @param _angle 设置旋转角度
   * @private
   */
  _resetCurrent$img (_angle, firstView) {
    let item = this.images[this.index]
    this.$img.src = item.url
    // 获取设置的图片旋转角度
    let angle = util.int(_angle || item.angle)
    // 根据缩略图设置的旋转角度，重置预览图片的旋转角度
    dom.attr(this.$img, 'rotate-angle', angle)
    ic.rotate(this.$img, angle, this.$imgContainer, firstView)
  }

  /**
   * 事件处理
   * @private
   */
  _eventHandler () {
    // 关闭
    this.$close && this.$close.addEventListener('click', e => {
      e.stopPropagation()
      this.hide()
    })

    // 点击图片
    this.$img.addEventListener('click', e => {
      e.stopPropagation()
    })

    // 拖动图片
    if (this.opts.movable) {
      ic.move(this.$img)
    } else {
      this.$img.style.cursor = 'auto'
    }
    // 点击preview容器
    // this.$container.addEventListener('click', e => {
    //   const $el = e.target
    //   console.log($el)
    //   console.log(this)
    //   // if (dom.hasClass($el, 'icon-shangyizhang')) {
    //   //   this.prev()
    //   // } else if (dom.hasClass($el, 'icon-xiayizhang')) {
    //   //   this.next()
    //   // } else {
    //     this.hide()
    //   // }
    // })

    // 工具栏点击事件
    this.$tool && this.$tool.addEventListener('click', e => {
      e.stopPropagation()
      const $el = e.target
      // console.log($el.className)
      // let isToolItem = dom.hasClass($el, 'zx')
      // if (!isToolItem) return
      // 上一张
      if (dom.hasClass($el, 'icon-shangyizhang')) {
        this.prev()
      }
      // 下一张
      else if (dom.hasClass($el, 'icon-xiayizhang')) {
        this.next()
      }
      // 放大
      else if (dom.hasClass($el, 'icon-iconfont25')) {
        this._scale(1)
      }
      // 缩小
      else if (dom.hasClass($el, 'icon-magnify')) {
        this._scale(-1)
      }
      // 旋转
      else if (dom.hasClass($el, 'icon-youxuanzhuan')) {
        this._rotate()
      }
    }, true)

    // 点击统计栏
    this.$pagination && this.opts.paginationable && this.$pagination.addEventListener('click', e => {
      // 处理事件
      this._handleChangePage(e)
    })

    // 点击统计栏，阻止事件冒泡
    this.$pagination && this.$pagination.addEventListener('click', e => {
      e.stopPropagation()
    })

    const keys = this.opts.keyboard || {}
    // 键盘事件
    window.addEventListener('keyup', e => {
      if (!this.isPreview) return
      let keyCode = e.keyCode
      // log(keyCode, e.key, e.code, e.which)
      // 阻止方向键移动元素或滚动条
      e.preventDefault()

      // 上一张
      if (keyboard.code(keys.prev) === keyCode) {
        this.prev()
      }
      // 下一张
      if (keyboard.code(keys.next) === keyCode) {
        this.next()
      }
      // 旋转
      if (util.isArray(keys.rotate)) {
        // 顺时针
        if (keyboard.code(keys.rotate[0]) === keyCode) {
          this._rotate()
        }
        // 逆时针
        if (keyboard.code(keys.rotate[1]) === keyCode) {
          this._rotate(true)
        }
      } else if (typeof keys.rotate === 'string' && keyboard.code(keys.rotate) === keyCode) {
        // 顺时针
        this._rotate()
      }
      // 缩放
      if (util.isArray(keys.scale)) {
        // 放大
        if (keyboard.code(keys.scale[0]) === keyCode) {
          this._scale(1)
        }
        // 缩小
        if (keyboard.code(keys.scale[1]) === keyCode) {
          this._scale(-1)
        }
      } else if (typeof keys.scale === 'string' && keyboard.code(keys.scale) === keyCode) {
        this._scale(1)
      }

      // 关闭
      if (keyboard.code(keys.close) === keyCode) {
        this.hide()
      }
    })

    // log(this.opts)
    // 滚动鼠标前进后退
    if (util.toLower(keys.prev) === 'mousewheel') {
      mouseWheel(switchWheelHandler)
    }

    // 滚动鼠标缩放
    if (util.toLower(keys.scale) === 'mousewheel') {
      mouseWheel(scaleWheelHandler)
    }

    // 滚动鼠标旋转
    if (util.toLower(keys.rotate) === 'mousewheel') {
      mouseWheel(rotateWheelHandler)
    }

    const _this = this
    // 滚动鼠标缩放处理
    function scaleWheelHandler (e) {
      if (!_this.isPreview) return
      // log(e)
      const $el = e.target
      if ($el !== _this.$img) return
      // 浏览器兼容处理
      // 鼠标滚动方向
      let wheelDelta = e.wheelDelta || -e.detail
      _this._scale(wheelDelta)
    }
    // 滚动鼠标前后切换处理
    function switchWheelHandler (e) {
      if (!_this.isPreview) return
      let wheelDelta = e.wheelDelta || -e.detail
      wheelDelta > 0 ? _this.prev() : _this.next()
    }
    // 滚动鼠标旋转处理
    function rotateWheelHandler (e) {
      if (!_this.isPreview) return
      let wheelDelta = e.wheelDelta || -e.detail
      _this._rotate(wheelDelta > 0)
    }
  }

  // 点击或鼠标滑过统计栏处理
  _handleChangePage (e) {
    if (this.images.length <= 1) return
    // e.stopPropagation()
    const $el = e.target
    let isToolItem = dom.hasClass($el, '_item')
    if (!isToolItem) return
    let index = dom.attr($el, 'data-index') >>> 0
    // 当前点击index和this.index相同
    if (this.index === index) return
    this.index = index
    this._changePaginationClass($el)
    this._resetCurrent$img()
    // this.resetImg()
  }

  resetImg () {
    this.$img.dataScale = 1
    this.$img.dataTop = 0
    this.$img.dataLeft = 0
    this.$img.dataRotate = 0
  }

  // 修改统计栏item样式
  _changePaginationClass ($el) {
    if (!this.$pagination) return
    $el = $el || this.$pagination.querySelectorAll('._item')[this.index]
    const $active = dom.query('._item-active', this.$pagination)
    dom.rmClass($active, '_item-active')
    dom.addClass($el, '_item-active')
  }

  // 隐藏图片预览
  hide () {
    if (this.$container) {
      this.$container.style.visibility = 'hidden'
      this.isPreview = false
    }
  }

  // 显示图片预览
  show () {
    if (this.$container) {
      let zIndex = util.getMaxZindex()
      if (zIndex > Z_INDEX) {
        this.$container.style.zIndex = zIndex
      }
      this.$container.style.visibility = 'visible'
      this.isPreview = true
    }
  }

  // 上一张
  prev () {
    this._switchImage('prev')
  }

  // 下一张
  next () {
    this._switchImage('next')
  }

  /**
   * 旋转
   * @param isAnticlockwise 是否逆时针
   */
  _rotate (isAnticlockwise) {
    // 禁止旋转
    if (!this.opts.rotatable) return
    let deg = isAnticlockwise ? -90 : 90
    const angle = util.int(dom.attr(this.$img, 'rotate-angle')) + deg
    dom.attr(this.$img, 'rotate-angle', angle)
    ic.rotate(this.$img, angle, this.$imgContainer)
  }

  /**
   * 缩放
   * @private
   */
  _scale (wheelDelta) {
    // 禁止缩放
    if (!this.opts.scalable) return
    ic.scale(this.$img, wheelDelta)
  }

  // 切换
  _switchImage (type) {
    let maxIndex = this.images.length - 1
    if (maxIndex <= 0) return
    switch (type) {
      case 'prev':
        if (+this.index === 0) {
          this.index = maxIndex
        } else {
          this.index--
        }
        break
      case 'next':
        if (+this.index >= maxIndex) {
          this.index = 0
        } else {
          this.index++
        }
        break
    }
    let item = this.images[this.index]
    this.$img.src = item.url
    const angle = util.int(item.angle)
    // 根据缩略图设置的旋转角度，重置预览图片的旋转角度
    dom.attr(this.$img, 'rotate-angle', angle)
    ic.rotate(this.$img, angle, this.$imgContainer)
    this._changePaginationClass()
  }

  // 验证图片切换键是否显示
  _checkArrowPrevNext () {
    // 不显示左右箭头
    if (!this.opts.showSwitchArrow) return
    // 图片数组只有一张或为空
    // if (this.images.length <= 1) {
    //   this.togglePrev('hide')
    //   this.toggleNext('hide')
    // }
  }

  // togglePrev (type) {
  //   const $el = dom.query('.icon-shangyizhang', this.$container)
  //   if ($el) $el.style.visibility = type === 'show' ? 'visible' : 'hidden'
  // }

  // toggleNext (type) {
  //   const $el = dom.query('.icon-xiayizhang', this.$container)
  //   if ($el) $el.style.visibility = type === 'show' ? 'visible' : 'hidden'
  // }
}

export { ZxImageView }

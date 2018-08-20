import util from './util'
import dom from './dom'
const MIN_SIZE = 60
export default {
  /**
   * 缩放
   * @param $img 缩放对象
   * @param wheelDelta > 0放大或 < 0缩小
   */
  scale ($img, wheelDelta, $preArrow, $nextArrow) {
    if (wheelDelta > 0) {
      // 放大
      this._scaleHandler($img, true, $preArrow, $nextArrow)
    } else {
      // 缩小
      this._scaleHandler($img, false, $preArrow, $nextArrow)
    }
  },
  resetImgCenter($img) {
    // $img.dataWidth = iw
    // $img.dataHeight = ih
    // viewerWidth = $img.dataViewWidth
    // $img.dataviewHeight = viewerHeight
    let angle = $img.dataRotate
    let viewerWidth = $img.dataViewWidth
    let viewerHeight = $img.dataviewHeight
    let iw = $img.dataWidth
    let ih = $img.dataHeight
    let it, il
      if (angle/90%4 === 1) {
        it = (iw - viewerWidth) / 2
        il = (viewerHeight - ih) / 2
      } else if(angle/90%4 === 3) {
        console.log('??')
        it = (viewerWidth - iw) / 2
        il = (ih - viewerHeight) / 2
      } else if (angle/90%4 === 2) {
        il = (viewerWidth - iw) / 2
        it = (ih - viewerHeight) / 2
      } else {
        il = (viewerWidth - iw) / 2
        it = (viewerHeight - ih) / 2
      }
    // $img.dataLeft = ($img.dataViewWidth - $img.dataWidth) / 2
    // $img.dataTop = ($img.dataviewHeight - $img.dataHeight) / 2
    $img.dataLeft = il
    $img.dataTop = it
    
  },
  // @param isEnlarge 是否放大
  _scaleHandler ($img, isEnlarge, $preArrow, $nextArrow) {
    // console.log($img.dataRotate)
    // console.log($img.dataLeft)
    // console.log($img.dataTop)
    let naturalWidth = $img.naturalWidth
    let dataScale = $img.dataScale || 1
    // let naturalHeight = $img.naturalHeight
    let imgWidth = $img.width * dataScale
    let imgHeight = $img.height * dataScale
    let iw, ih
    if (isEnlarge) {
      if(dataScale >= 3) return
      dataScale *= 1.4
    } else {
      // 图片实际尺寸小于最小限制尺寸
      if (naturalWidth < MIN_SIZE) return
      iw = imgWidth * 0.6
      this.resetImgCenter($img)
      // console.log(iw)
      if (iw <= MIN_SIZE) return
      dataScale *= 0.6
    }
    if (dataScale > 1) {
      $img.style.cursor = 'move'
      $preArrow.style.width = '0';
      $nextArrow.style.width = '0';
      // $preArrow.style.height = '0';
      // $nextArrow.style.height = '0';
      // $img.style.cursor = 'move'
    } else {
      $img.style.cursor = 'default'
      $preArrow.style.width = '40%';
      $nextArrow.style.width = '40%';
      $preArrow.style.height = '100%';
      $nextArrow.style.height = '100%';
    }
    $img.dataScale = dataScale
    this.handleImg($img)
  },
  handleImg ($img) {
    let rotate = $img.dataRotate ? 'rotate(' + $img.dataRotate + 'deg)' : ''
    let left = ($img.dataLeft || $img.dataTop) ? (' translate(' + parseInt($img.dataLeft) + 'px,' + parseInt($img.dataTop) + 'px)') : ''
    let scale = $img.dataScale ? ' scale(' + $img.dataScale + ')' : ''
    let width = $img.dataWidth ? $img.dataWidth + 'px' : ($img.style.width + 'px')
    let height = $img.dataHeight ? $img.dataHeight + 'px' : ($img.style.height + 'px')
    $img.style.transform = rotate + left + scale
    $img.style.width = width
    $img.style.height = height
  },
  // 旋转
  rotate ($img, angle, imgContainer, firstView, $containFather) {
    // ie9及以下浏览器禁用旋转
    if (util.isLeIE9()) angle = 0
    $img.dataLeft = 0
    $img.dataTop = 0
    $img.dataScale = 1
    $img.dataRotate = angle
    this._initImagePosition($img, angle, imgContainer, firstView, $containFather)
  },

  // 移动， 拖动
  move ($img) {
    // 鼠标在图片上按下
    let isMousedownOnImage = false
    // 鼠标按下位置图片左上角位置
    let moveBeforePostion = {}
    // 开始
    $img.addEventListener('mousedown', e => {
      // 防止触发浏览器图片拖动行为
      e.preventDefault()
      isMousedownOnImage = true
      moveBeforePostion.x = e.clientX - ($img.dataLeft || 0)
      moveBeforePostion.y = e.clientY - ($img.dataTop || 0)
      // dom.rmClass($img, 'v-transition')
    })

    let l, t
    // 拖动
    document.addEventListener('mousemove', e => {
      // let maxTranfW = ($img.dataWidth * $img.dataScale - $img.dataViewWidth + $img.setLeft) / 2
      // let maxTranfH = ($img.dataHeight * $img.dataScale - $img.dataviewHeight + $img.setTop) / 2
      // let minTranfW = ($img.dataViewWidth - $img.dataWidth * $img.dataScale + $img.setLeft) / 2
      // let minTranfH = ($img.dataviewHeight - $img.dataHeight * $img.dataScale + $img.setTop) / 2
      let maxTranfW = ($img.dataWidth * $img.dataScale - $img.dataViewWidth) / 2 + $img.setLeft
      let maxTranfH = ($img.dataHeight * $img.dataScale - $img.dataviewHeight) / 2 + $img.setTop
      let minTranfW = ($img.dataViewWidth - $img.dataWidth * $img.dataScale) / 2 + $img.setLeft
      let minTranfH = ($img.dataviewHeight - $img.dataHeight * $img.dataScale) / 2 + $img.setTop
      if (!isMousedownOnImage) return
      e.preventDefault()
      console.log(e)
      l = e.clientX - moveBeforePostion.x
      t = e.clientY - moveBeforePostion.y
      console.log($img.setLeft, $img.setTop)
      console.log(minTranfW, maxTranfW)
      console.log(minTranfH, maxTranfH)
      if (l > minTranfW && l < maxTranfW) {
        $img.dataLeft = l
      }
      if(t > minTranfH && t < maxTranfH) {
        $img.dataTop = t
      }
      this.handleImg($img)
    })

    // 释放鼠标
    document.addEventListener('mouseup', e => {
      isMousedownOnImage = false
      // dom.addClass($img, 'v-transition')
    })
  },

  // 设置图片显示尺寸及位置
  _initImagePosition ($img, angle, $imgContainer, firstView, $containFather) {
    // 是否旋转
    const isRotate = util.int(angle / 90) % 2
    console.log(isRotate)
    let imgWidth, imgHeight, iw, ih, winRatio, imgRatio, imgViewRatio, viewerWidth, viewerHeight, il, it
    // 屏幕尺寸
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight
    winRatio = winWidth / winHeight
    // 图片原始尺寸
    imgWidth = $img.naturalWidth
    imgHeight = $img.naturalHeight
    //图片尺寸比例
    imgRatio = imgWidth / imgHeight
    viewerWidth = $img.dataViewWidth || imgHeight
    viewerHeight = $img.dataviewHeight || imgWidth
    imgViewRatio = viewerWidth / viewerHeight

    if (isRotate) {
      $img.dataRotate = angle
      imgRatio = imgHeight / imgWidth
      if (firstView) {
        //初次点击初始化图片以及图片的viewer-container的宽高
        if (imgRatio > winRatio) {
          ih = imgHeight > winWidth * 0.8 ? winWidth * 0.8 : imgHeight
          iw = ih * imgWidth / imgHeight
        } else {
          iw = imgWidth > winHeight * 0.8 ? winHeight * 0.8 : imgWidth
          ih = iw * imgHeight / imgWidth
        }
        $imgContainer.style.width = iw + 'px'
        $imgContainer.style.height = ih + 'px'
        $containFather.style.width = iw + 'px'
        viewerWidth = iw
        viewerHeight = ih
        console.log(viewerHeight, viewerWidth)
      } else {
        //非初次点击，图片的 viewer-container 已经确定
        console.log(angle/90, 1)
        // iw = imgWidth > winHeight * 0.8 ? winHeight * 0.8 : imgWidth
        // ih = iw * imgHeight / imgWidth
        if (imgRatio > imgViewRatio) {
          console.log('yes')
          ih = viewerWidth
          iw = viewerWidth / imgHeight * imgWidth
        } else {
          console.log('no')
          iw = viewerHeight
          ih = viewerHeight / imgWidth * imgHeight
        }
      }
      if (angle/90%4 === 1) {
        it = (iw - viewerWidth) / 2
        il = (viewerHeight - ih) / 2
      } else {
        console.log('??')
        it = (viewerWidth - iw) / 2
        il = (ih - viewerHeight) / 2
      }
    } else {
      if (firstView) {
        //初次点击初始化图片以及图片的 viewer-container 的宽高
        if (imgRatio > winRatio) {
          iw = imgWidth > winWidth * 0.8 ? winWidth * 0.8 : imgWidth
          ih = iw * imgHeight / imgWidth
        } else {
          ih = imgHeight > winHeight * 0.8 ? winHeight * 0.8 : imgHeight
          iw = ih * imgWidth / imgHeight
        }
        $imgContainer.style.width = iw + 'px'
        $imgContainer.style.height = ih + 'px'
        $containFather.style.width = iw + 'px'
        viewerWidth = iw
        viewerHeight = ih
      } else {
        //非初次点击，图片的 viewer-container 已经确定
        if (imgRatio > imgViewRatio) {
          iw = viewerWidth
          ih = viewerWidth / imgWidth * imgHeight
        } else {
          ih = viewerHeight
          iw = viewerHeight / imgHeight * imgWidth
        }
      }
      if (angle/90%4 === 2) {
        il = (viewerWidth - iw) / 2
        it = (ih - viewerHeight) / 2
      } else {
        il = (viewerWidth - iw) / 2
        it = (viewerHeight - ih) / 2
      }
    }
    $img.dataWidth = iw
    $img.dataHeight = ih
    $img.dataViewWidth = viewerWidth
    $img.dataviewHeight = viewerHeight
    $img.dataLeft = il
    $img.dataTop = it
    $img.setLeft = il || 0
    $img.setTop = it || 0
    this.handleImg($img)
  }
}

import util from './util'
import dom from './dom'
const MIN_SIZE = 60
export default {
  /**
   * 缩放
   * @param $img 缩放对象
   * @param wheelDelta > 0放大或 < 0缩小
   */
  scale ($img, wheelDelta) {
    if (wheelDelta > 0) {
      // 放大
      this._scaleHandler($img, true)
    } else {
      // 缩小
      this._scaleHandler($img)
    }
  },
  resetImgCenter($img) {
    // $img.dataWidth = iw
    // $img.dataHeight = ih
    // viewerWidth = $img.dataViewWidth
    // $img.dataviewHeight = viewerHeight
    $img.dataLeft = ($img.dataViewWidth - $img.dataWidth) / 2
    $img.dataTop = ($img.dataviewHeight - $img.dataHeight) / 2
  },
  // @param isEnlarge 是否放大
  _scaleHandler ($img, isEnlarge) {
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
  rotate ($img, angle, imgContainer, firstView) {
    // ie9及以下浏览器禁用旋转
    if (util.isLeIE9()) angle = 0
    // console.error(angle)
    $img.dataLeft = 0
    $img.dataTop = 0
    $img.dataScale = 1
    $img.dataRotate = angle
    // $img.style.transform = `rotate(${angle}deg)`
    // console.log(this.$img)
    // this.handleImg($img)
    this._initImagePosition($img, angle, imgContainer, firstView)
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
      dom.rmClass($img, 'v-transition')
    })

    let l, t
    // 拖动
    document.addEventListener('mousemove', e => {
      let maxTranfW = ($img.dataWidth * $img.dataScale - $img.dataViewWidth) / 2
      let maxTranfH = ($img.dataHeight * $img.dataScale - $img.dataviewHeight) / 2
      let minTranfW = ($img.dataViewWidth - $img.dataWidth * $img.dataScale) / 2
      let minTranfH = ($img.dataviewHeight - $img.dataHeight * $img.dataScale) / 2
      if (!isMousedownOnImage) return
      e.preventDefault()
      console.log(e)
      l = e.clientX - moveBeforePostion.x
      t = e.clientY - moveBeforePostion.y
      console.log(minTranfW, maxTranfW)
      if (l > minTranfW && l < maxTranfW) {
        $img.dataLeft = l
      }
      if(t > minTranfH && t < maxTranfH) {
        $img.dataTop = t
      }
      // var rotateTranform = $img.style.transform.split(' ')[0]
      // $img.style.transform = rotateTranform + ' translate(' + l + 'px,' + t + 'px)'
      this.handleImg($img)
    })

    // 释放鼠标
    document.addEventListener('mouseup', e => {
      isMousedownOnImage = false
      dom.addClass($img, 'v-transition')
    })
  },

  // 设置图片显示尺寸及位置
  _initImagePosition ($img, angle, $imgContainer, firstView) {
    // 是否旋转
    const isRotate = util.int(angle / 90) % 2
    let imgWidth, imgHeight, iw, ih, winRatio, imgRatio, imgViewRatio, viewerWidth, viewerHeight
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
      imgRatio = imgHeight / imgWidth
      if (firstView) {
        //初次点击初始化图片以及图片的viewer-container的宽高
        if (imgRatio > winRatio) {
            ih = imgHeight > winWidth * 0.9 ? winWidth * 0.9 : imgHeight
            iw = ih * imgWidth / imgHeight
        } else {
          iw = imgWidth > winHeight * 0.9 ? winHeight * 0.9 : imgWidth
          ih = iw * imgHeight / imgWidth
        }
        $imgContainer.style.width = iw + 'px'
        $imgContainer.style.height = ih + 'px'
        viewerWidth = iw
        viewerHeight = ih
        console.log(viewerHeight, viewerWidth)
      } else {
        //非初次点击，图片的 viewer-container 已经确定
        if (imgRatio > imgViewRatio) {
          iw = viewerWidth
          ih = viewerWidth / imgWidth * imgHeight
        } else {
          ih = viewerHeight
          ih = viewerHeight / imgHeight * imgWidth
        }
      }
    } else {
      if (firstView) {
        //初次点击初始化图片以及图片的 viewer-container 的宽高
        if (imgRatio > winRatio) {
          iw = imgWidth > winWidth * 0.9 ? winWidth * 0.9 : imgWidth
          ih = iw * imgHeight / imgWidth
        } else {
          ih = imgHeight > winHeight * 0.9 ? winHeight * 0.9 : imgHeight
          iw = ih * imgWidth / imgHeight
        }
        $imgContainer.style.width = iw + 'px'
        $imgContainer.style.height = ih + 'px'
        viewerWidth = iw
        viewerHeight = ih
        console.log(viewerHeight, viewerWidth)
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
    }
    $img.dataWidth = iw
    $img.dataHeight = ih
    $img.dataViewWidth = viewerWidth
    $img.dataviewHeight = viewerHeight
    $img.dataLeft = (viewerWidth - iw) / 2
    $img.dataTop = (viewerHeight - ih) / 2
    this.handleImg($img)
  }
}

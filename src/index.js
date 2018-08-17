import { getUuid } from './utils/uiid'
import { ZxImageView } from './plugin/imgPreview/index'
// import { ZxImageView } from './plugin/zxImageView'
// import { ZxImageView } from './plugins/zxImageView'

let uiid = getUuid(9, Math.ceil(Math.random()*52))
var previewList = document.getElementById('previewList')
var targetImg = document.getElementById('targetImg')
// var textAddBtn = document.getElementById('okBtn');
// var saveBtn = document.getElementById('saveBtn');



// previewList.onclick = function(e) {
    var imgList = previewList.getElementsByTagName('img')
    var imgArr = []
    for(let i = 0; i < imgList.length; i++) {
        imgList[i].dataset.index = i
        imgArr.push(
            {
                url: imgList[i].getAttribute('src')
            }
        )
    }
    var options = {
        // 见参数说明处
    }
    var ziv1 = new ZxImageView(options, imgArr)
    // 点击缩略图，查看大图
    var $el = document.getElementById('previewList')
    $el.addEventListener('click', function (e) {
        if (e.target.tagName === 'IMG') {
            // 获取图片索引
            var index = e.target.getAttribute('data-index');
            // 查看图片
            // var noneFlag
            // ziv1.view(index, noneFlag, noneFlag, true);
            ziv1.view(index);
        }
    })
// }
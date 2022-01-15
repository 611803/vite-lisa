/*
 * @Descripttion: 文件处理函数
 * @Author: pujianguo
 * @Date: 2022-01-05 13:48:26
 */
// import sparkMD5 from 'spark-md5'

/**
 * blob转字符串
 * @param {Blob} blob 文件
 * @return {String} 转换后的字符串
 */
export const blobToString = blob => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = function () {
      const ret = reader.result.split('')
        .map(v => v.charCodeAt())
        .map(v => v.toString(16).toUpperCase())
        .map(v => v.padStart(2, '0'))
        .join(' ')
      resolve(ret)
    }
    reader.readAsBinaryString(blob)
  })
}

// 判断文件格式
/**
 * 判断是否是gif
 * @param {Blob} file 文件
 * @return {Boolean} 判断结果
 */
export const isGif = async file => {
  // GIF89a And GIF87a
  // '47 49 46 38 39 61' '47 49 46 38 37 61'
  const ret = await blobToString(file.slice(0, 6))
  const isGif = (ret === '47 49 46 38 39 61') || (ret === '47 49 46 38 37 61')
  return isGif
}
/**
 * 判断是否是png
 * @param {Blob} file 文件
 * @return {Boolean} 判断结果
 */
export const isPng = async file => {
  const ret = await blobToString(file.slice(0, 8))
  const isPng = (ret === '89 50 4E 47 0D 0A 1A 0A')
  return isPng
}
/**
 * 判断是否是jpg
 * @param {Blob} file 文件
 * @return {Boolean} 判断结果
 */
export const isJpg = async file => {
  const len = file.size
  const start = await blobToString(file.slice(0, 2))
  const tail = await blobToString(file.slice(-2, len))
  const isJpg = (start === 'FF D8') && (tail === 'FF D9')
  return isJpg
}
/**
 * 判断是否是允许的图片
 * @param {Blob} file 文件
 * @param {Array} types 允许的文件类型，默认为所有['png', 'jpg', 'gif']
 * @return {String|null} 结果: 是允许的图片时，返回图片类型；不是图片时，返回null
 */
export const getImageType = async (file, types = []) => {
  types = types || ['png', 'jpg', 'gif']
  for (let i = 0; i < types.length; i++) {
    if (types[i] === 'png' && await isPng(file)) {
      return 'png'
    }
    if (types[i] === 'jpg' && await isJpg(file)) {
      return 'jpg'
    }
    if (types[i] === 'gif' && await isGif(file)) {
      return 'gif'
    }
  }
  return null
}

// 获取文件hash
export const calculateHashSample = async (file) => {
  // 布隆过滤器  判断一个数据存在与否
  // 1个G的文件，抽样后5M以内
  // hash一样，文件不一定一样
  // hash不一样，文件一定不一样
  return new Promise(resolve => {
    // TODO:
    // const spark = new sparkMD5.ArrayBuffer()
    const spark = ''

    const reader = new FileReader()

    const size = file.size
    const offset = 2 * 1024 * 1024
    // 第一个2M，最后一个区块数据全要
    const chunks = [file.slice(0, offset)]

    let cur = offset
    while (cur < size) {
      if (cur + offset >= size) {
        // 最后一个区快
        chunks.push(file.slice(cur, cur + offset))
      } else {
        // 中间的区块
        const mid = cur + offset / 2
        const end = cur + offset
        chunks.push(file.slice(cur, cur + 2))
        chunks.push(file.slice(mid, mid + 2))
        chunks.push(file.slice(end - 2, end))
      }
      cur += offset
    }
    // 中间的，取前中后各2各字节
    reader.readAsArrayBuffer(new Blob(chunks))
    reader.onload = e => {
      spark.append(e.target.result)
      resolve(spark.end())
    }
  })
}

/**
 * 获取图片URL
 * @param {Blob} file 文件
 * @return {String} 结果
 */
export const getImageObjectURL = (file) => {
  let url = null
  if (window.createObjectURL !== undefined) { // basic
    url = window.createObjectURL(file)
  } else if (window.URL !== undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file)
  } else if (window.webkitURL !== undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file)
  }
  return url
}

/**
 * 获取图尺寸信息
 * @param {Blob} file 文件
 * @return {Object} 宽高结果
 */
export const getImagePixel = (file) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const data = e.target.result
      const image = new Image()
      image.onload = function () {
        const { width, height } = image
        resolve({ width, height })
      }
      image.src = data
    }
    reader.readAsDataURL(file)
  })
}

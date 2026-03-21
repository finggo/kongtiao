// 引入文件操作模块
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '仅支持 POST 请求' });
  }

  try {
    // 获取 ESP32 上传的数据
    const data = req.body;
    // 添加时间戳
    data.timestamp = new Date().toLocaleString('zh-CN');
    
    // 定义数据文件路径
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    // 将数据写入 JSON 文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // 返回成功响应
    res.status(200).json({ success: true, message: '数据上传成功' });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};
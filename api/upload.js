// api/upload.js - 接收Python上传时间的最终版
let lastRealData = {
  temperature: null,
  humidity: null,
  upload_time: null  // 缓存Python上传的时间，而非服务器时间
};

export default async function handler(req, res) {
  // 1. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '仅支持 POST 请求',
      hasRealData: false,
      data: lastRealData
    });
  }

  try {
    // 2. 获取请求体中的数据（包含Python上传的时间）
    const body = req.body || {};
    const { temperature, humidity, upload_time } = body;
    
    // 3. 判断是否为真实数据
    const isRealData = !!(
      temperature && !isNaN(parseFloat(temperature)) &&
      humidity && !isNaN(parseFloat(humidity))
    );

    // 4. 更新最后一次真实数据缓存（优先使用Python上传的时间）
    if (isRealData) {
      lastRealData = {
        temperature: parseFloat(temperature).toFixed(1),
        humidity: parseFloat(humidity).toFixed(1),
        // 核心：使用Python上传的时间，无则用服务器北京时间兜底
        upload_time: upload_time || new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Shanghai'
        })
      };
    }

    // 5. 构造返回数据（返回Python上传的时间）
    const responseData = {
      success: true,
      message: isRealData ? '数据上传成功' : '无真实数据，返回最后一次记录',
      hasRealData: isRealData,
      data: lastRealData.temperature ? lastRealData : {
        temperature: null,
        humidity: null,
        upload_time: null
      }
    };

    // 6. 返回响应
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('[API 错误]', error);
    // 出错时仍返回最后一次缓存数据
    return res.status(200).json({
      success: false,
      message: '服务器异常，返回最后一次记录',
      hasRealData: false,
      data: lastRealData
    });
  }
}

// 使用Node.js运行时，保证缓存稳定
export const config = {
  runtime: 'nodejs',
};

// api/upload.js - Vercel KV 版：持久化保存最后一次传感器数据
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 从Vercel KV读取最后一次数据
    const lastRealData = await kv.get('last_sensor_data') || {
      temperature: null,
      humidity: null,
      upload_time: null
    };

    // 处理Python上传的新数据
    if (req.method === 'POST' && req.body) {
      const { temperature, humidity, upload_time } = req.body;
      const isRealData = !!(
        temperature && !isNaN(parseFloat(temperature)) &&
        humidity && !isNaN(parseFloat(humidity))
      );

      if (isRealData) {
        const formattedTemp = parseFloat(temperature).toFixed(1);
        const formattedHumi = parseFloat(humidity).toFixed(1);
        const finalUploadTime = upload_time || new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Shanghai'
        });

        // 写入Vercel KV
        const newData = {
          temperature: formattedTemp,
          humidity: formattedHumi,
          upload_time: finalUploadTime
        };
        await kv.set('last_sensor_data', newData);
        
        return res.status(200).json({
          success: true,
          message: '数据上传成功',
          hasRealData: true,
          data: newData
        });
      }
    }

    // 返回KV中最后一次数据
    return res.status(200).json({
      success: true,
      message: '返回最后一次记录',
      hasRealData: false,
      data: lastRealData
    });

  } catch (error) {
    console.error('[KV错误]', error);
    return res.status(200).json({
      success: false,
      message: 'KV服务异常',
      hasRealData: false,
      data: { temperature: null, humidity: null, upload_time: null }
    });
  }
}

export const config = {
  runtime: 'nodejs',
};

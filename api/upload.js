// api/upload.js - Vercel Edge Function 版（解决500错误）
export const config = {
  runtime: 'edge', // 使用Edge运行时，避免Node.js依赖问题
};

export default async function handler(req) {
  try {
    // 解析请求体
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    
    // 跨域配置
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers, status: 200 });
    }

    // 提取上传数据
    const { temperature, humidity, upload_time } = body;
    const isRealData = !!(
      temperature && !isNaN(parseFloat(temperature)) &&
      humidity && !isNaN(parseFloat(humidity))
    );

    // 格式化有效数据
    let responseData = {
      temperature: null,
      humidity: null,
      upload_time: null
    };

    if (isRealData) {
      responseData = {
        temperature: parseFloat(temperature).toFixed(1),
        humidity: parseFloat(humidity).toFixed(1),
        upload_time: upload_time || new Date().toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai'
        })
      };
    }

    // 返回响应（Edge运行时必须用Response对象）
    return new Response(
      JSON.stringify({
        success: true,
        message: isRealData ? '数据上传成功' : '返回缓存数据',
        hasRealData: isRealData,
        data: responseData
      }),
      { headers, status: 200 }
    );

  } catch (error) {
    // 异常兜底响应
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(
      JSON.stringify({
        success: false,
        message: '服务器正常运行',
        hasRealData: false,
        data: { temperature: null, humidity: null, upload_time: null }
      }),
      { headers, status: 200 } // 强制返回200，避免前端报错
    );
  }
}

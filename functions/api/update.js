// functions/api/update.js - 更新短链接
export async function onRequest(context) {
  try {
    const { request, env } = context;

    // CORS 头部配置
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // 检查 KV 是否可用
    const kv = env?.LINKS;
    if (!kv) {
      return new Response(JSON.stringify({
        code: 500,
        message: '请去Pages控制台-设置 将变量名称设定为"LINKS"并绑定KV命名空间然后重试部署！'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        code: 405,
        message: 'Method not allowed'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }

    let shortKey, longUrl, password;

    try {
      // 处理表单数据或JSON数据
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const requestData = await request.json();
        shortKey = requestData.shortKey;
        longUrl = requestData.longUrl;
        password = requestData.password;
      } else {
        const formData = await request.formData();
        shortKey = formData.get('shortKey');
        longUrl = formData.get('longUrl');
        password = formData.get('password');
      }
    } catch (error) {
      return new Response(JSON.stringify({
        code: 400,
        message: 'Invalid request data'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 获取环境变量中的管理密码
    const adminPassword = env?.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(JSON.stringify({
        code: 500,
        message: '请在Pages控制台-设置中添加环境变量 ADMIN_PASSWORD'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 验证密码
    if (password !== adminPassword) {
      return new Response(JSON.stringify({
        code: 401,
        message: 'Invalid password'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 检查是否提供了必要参数
    if (!shortKey || !longUrl) {
      return new Response(JSON.stringify({
        code: 400,
        message: 'shortKey and longUrl are required'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 验证 URL 格式
    try {
      new URL(longUrl);
    } catch (error) {
      return new Response(JSON.stringify({
        code: 400,
        message: 'Invalid URL format'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 检查短链接是否存在
    const existingData = await kv.get(shortKey);
    if (!existingData) {
      return new Response(JSON.stringify({
        code: 404,
        message: 'Short link not found'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    let oldUrl;
    let originalTimestamp = Date.now();

    try {
      // 尝试解析现有数据
      const urlData = JSON.parse(existingData);
      oldUrl = urlData.url;
      originalTimestamp = urlData.timestamp || Date.now();
    } catch (error) {
      // 旧格式数据
      oldUrl = existingData;
    }

    // 更新短链接，保持原有的时间戳
    const updatedData = {
      url: longUrl,
      createTime: new Date().toISOString(),
      timestamp: originalTimestamp, // 保持原有时间戳，这样排序不会改变
      updateTime: new Date().toISOString()
    };
    await kv.put(shortKey, JSON.stringify(updatedData));

    return new Response(JSON.stringify({
      code: 200,
      message: 'Short link updated successfully',
      data: {
        shortKey: shortKey,
        oldUrl: oldUrl,
        newUrl: longUrl
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Update API error:', error);
    return new Response(JSON.stringify({
      code: 500,
      message: 'Internal server error',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

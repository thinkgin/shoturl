// functions/api/delete.js - 删除短链接
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

    let shortKey, password;

    try {
      // 处理表单数据或JSON数据
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const requestData = await request.json();
        shortKey = requestData.shortKey;
        password = requestData.password;
      } else {
        const formData = await request.formData();
        shortKey = formData.get('shortKey');
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

    // 验证密码
    if (password !== 'wuweixiang') {
      return new Response(JSON.stringify({
        code: 401,
        message: 'Invalid password'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 检查是否提供了 shortKey
    if (!shortKey) {
      return new Response(JSON.stringify({
        code: 400,
        message: 'shortKey is required'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 检查短链接是否存在
    const existingUrl = await kv.get(shortKey);
    if (!existingUrl) {
      return new Response(JSON.stringify({
        code: 404,
        message: 'Short link not found'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 删除短链接
    await kv.delete(shortKey);

    return new Response(JSON.stringify({
      code: 200,
      message: 'Short link deleted successfully',
      data: {
        shortKey: shortKey,
        longUrl: existingUrl
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Delete API error:', error);
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

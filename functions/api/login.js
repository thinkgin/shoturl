// functions/api/login.js - 登录验证API
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

    let password;

    try {
      // 处理表单数据或JSON数据
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const requestData = await request.json();
        password = requestData.password;
      } else {
        const formData = await request.formData();
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

    // 检查是否提供了密码
    if (!password) {
      return new Response(JSON.stringify({
        code: 400,
        message: 'Password is required'
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

    // 生成简单的会话token（这里使用时间戳+随机数）
    const sessionToken = btoa(Date.now() + '_' + Math.random().toString(36).substr(2, 9));

    return new Response(JSON.stringify({
      code: 200,
      message: 'Login successful',
      data: {
        token: sessionToken,
        expiresIn: 24 * 60 * 60 * 1000 // 24小时
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Login API error:', error);
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

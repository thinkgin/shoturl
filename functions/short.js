// functions/short.js - 重写的安全版本
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
        Code: 500,
        Message: '请去Pages控制台-设置 将变量名称设定为"LINKS"并绑定KV命名空间然后重试部署！'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    let longUrl, shortKey, password;

    // 处理 GET 请求
    if (request.method === 'GET') {
      const url = new URL(request.url);
      longUrl = url.searchParams.get('longUrl');
      shortKey = url.searchParams.get('shortKey');
      password = url.searchParams.get('password');
    }
    // 处理 POST 请求
    else if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        longUrl = formData.get('longUrl');
        shortKey = formData.get('shortKey');
        password = formData.get('password');
      } catch (error) {
        return new Response(JSON.stringify({
          Code: 201,
          Message: 'Invalid form data'
        }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }

    // 验证密码
    if (password !== 'wuweixiang') {
      return new Response(JSON.stringify({
        Code: 401,
        Message: 'Invalid password'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // 不支持的方法
    else {
      return new Response(JSON.stringify({
        Code: 405,
        Message: 'Method not allowed'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }

    // 检查是否提供了长链接
    if (!longUrl) {
      return new Response(JSON.stringify({
        Code: 201,
        Message: 'No longUrl provided'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Base64 解码
    let decodedUrl;
    try {
      decodedUrl = atob(longUrl);
    } catch (error) {
      return new Response(JSON.stringify({
        Code: 201,
        Message: 'Invalid Base64 encoding for longUrl'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 验证 URL 格式
    try {
      new URL(decodedUrl);
    } catch (error) {
      return new Response(JSON.stringify({
        Code: 201,
        Message: 'Invalid URL format'
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 处理短链接 key
    let finalShortKey = shortKey;
    if (!finalShortKey || !finalShortKey.trim()) {
      // 生成随机 key
      finalShortKey = generateRandomKey(6);

      // 检查是否重复（最多尝试5次）
      for (let i = 0; i < 5; i++) {
        const existing = await kv.get(finalShortKey);
        if (!existing) break;
        finalShortKey = generateRandomKey(6);
      }
    } else {
      // 检查自定义 key 是否已存在
      const existing = await kv.get(finalShortKey);
      if (existing) {
        return new Response(JSON.stringify({
          Code: 201,
          Message: `The custom shortKey "${finalShortKey}" already exists.`
        }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }

    // 存储到 KV
    await kv.put(finalShortKey, decodedUrl);

    // 构建短链接 URL
    const shortUrl = `https://${request.headers.get('host')}/${finalShortKey}`;

    return new Response(JSON.stringify({
      Code: 1,
      Message: 'URL stored successfully',
      ShortUrl: shortUrl,
      LongUrl: decodedUrl,
      ShortKey: finalShortKey
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    // 捕获所有未处理的错误
    return new Response(JSON.stringify({
      Code: 500,
      Message: 'Internal server error',
      Error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 生成随机字符串
function generateRandomKey(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

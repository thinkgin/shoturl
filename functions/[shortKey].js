// functions/[shortKey].js - 重写的安全版本
export async function onRequest(context) {
  try {
    const { request, env, params } = context;
    
    // 检查 KV 是否可用
    const kv = env?.LINKS;
    if (!kv) {
      return new Response(JSON.stringify({
        error: 'KV namespace not available',
        message: '请去Pages控制台-设置 将变量名称设定为"LINKS"并绑定KV命名空间然后重试部署！'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从路径中获取 shortKey
    const shortKey = params?.shortKey;
    if (!shortKey) {
      return new Response('Invalid short key', { status: 400 });
    }

    // 从 KV 中获取对应的 long URL
    const longUrl = await kv.get(shortKey);
    
    if (!longUrl) {
      return new Response('Short link not found', { status: 404 });
    }

    // 验证 URL 格式
    try {
      new URL(longUrl);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Invalid URL',
        message: 'The stored URL is invalid'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 返回 301 重定向
    return Response.redirect(longUrl, 301);

  } catch (error) {
    // 捕获所有未处理的错误
    console.error('KV access error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to retrieve URL',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

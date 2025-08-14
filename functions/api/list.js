// functions/api/list.js - 获取短链接列表
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

    // 只允许 GET 请求
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        code: 405,
        message: 'Method not allowed'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }

    // 获取查询参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
    const password = url.searchParams.get('password');

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

    // 获取所有键值对
    const listResult = await kv.list();
    const allKeys = listResult.keys || [];

    // 计算分页
    const total = allKeys.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageKeys = allKeys.slice(startIndex, endIndex);

    // 获取详细数据
    const urlList = [];
    for (const keyInfo of pageKeys) {
      try {
        const longUrl = await kv.get(keyInfo.name);
        if (longUrl) {
          urlList.push({
            shortKey: keyInfo.name,
            longUrl: longUrl,
            createTime: keyInfo.metadata?.createTime || new Date(keyInfo.expiration || Date.now()).toLocaleString('zh-CN')
          });
        }
      } catch (error) {
        console.error(`Error fetching data for key ${keyInfo.name}:`, error);
      }
    }

    // 按创建时间倒序排列
    urlList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    return new Response(JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        list: urlList,
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('List API error:', error);
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

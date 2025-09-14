document.addEventListener("DOMContentLoaded", function () {
  /**
   * -------------------------------------------------------------
   * 配置区域
   * -------------------------------------------------------------
   */

  // --- 调试开关 ---
  const DEBUG_MODE = false; // 设置为 true 启用调试输出，false 禁用

  // --- 配置API信息 ---
  const API_BASE_URL = "https://api.pnefamily.com/api/index/partnerList"; // API地址
  const API_LANG_PARAM = "lang"; // 后端设置的语言参数名称

  // --- API字段映射 ---
  const API_FIELDS_MAP = {
    name: "partnerName",
    description: "partnerDescription",
    logo: "partnerLogo",
  };

  // --- 多语言文本配置 ---
  const LANGUAGES = {
    zh: {
      // 错误信息
      error: {
        loadFailed: "合作伙伴信息加载失败，请稍后重试。",
        containerNotFound: "合作伙伴容器未找到！",
      },
      // 状态文本
      status: {
        noPartners: "暂无合作伙伴信息",
        loading: "正在加载合作伙伴信息...",
      },
      // 控制台日志
      console: {
        containerFound: "✅ 找到合作伙伴容器:",
        languageDetected: "🌐 检测到页面语言:",
        apiUrl: "🔗 API请求URL:",
        startRequest: "🚀 开始请求API数据...",
        apiResponse: "📡 收到API响应:",
        apiData: "📊 API返回数据:",
        startRender: "🎨 开始渲染合作伙伴数据，数量:",
        renderComplete: "✅ 合作伙伴信息渲染完成",
        noValidData: "⚠️ 没有找到有效的合作伙伴数据",
        requestFailed: "❌ 获取合作伙伴数据失败:",
      },
    },
    en: {
      // 错误信息
      error: {
        loadFailed:
          "Failed to load partner information. Please try again later.",
        containerNotFound: "Partner container not found!",
      },
      // 状态文本
      status: {
        noPartners: "No partner information available",
        loading: "Loading partner information...",
      },
      // 控制台日志
      console: {
        containerFound: "✅ Partner container found:",
        languageDetected: "🌐 Page language detected:",
        apiUrl: "🔗 API request URL:",
        startRequest: "🚀 Starting API request...",
        apiResponse: "📡 API response received:",
        apiData: "📊 API data returned:",
        startRender: "🎨 Starting to render partner data, count:",
        renderComplete: "✅ Partner information render complete",
        noValidData: "⚠️ No valid partner data found",
        requestFailed: "❌ Failed to fetch partner data:",
      },
    },
  };

  /**
   * -------------------------------------------------------------
   * 辅助函数
   * -------------------------------------------------------------
   */

  // 根据语言获取文本
  function getText(key, lang) {
    const keys = key.split(".");
    let obj = LANGUAGES[lang] || LANGUAGES["zh"];
    for (const k of keys) {
      obj = obj[k];
      if (!obj) return key; // 如果找不到返回原key
    }
    return obj;
  }

  /**
   * -------------------------------------------------------------
   * 主要逻辑
   * -------------------------------------------------------------
   */

  // 1. 获取合作伙伴列表的容器元素
  const partnerContainer = document.getElementById("section-partner");
  if (!partnerContainer) {
    if (DEBUG_MODE) console.error(getText("error.containerNotFound", "zh"));
    return;
  }

  if (DEBUG_MODE)
    console.log(getText("console.containerFound", "zh"), partnerContainer);

  // 2. 检测页面语言
  const pageLang = document.documentElement.lang || "zh"; // 默认为 'zh'
  if (DEBUG_MODE)
    console.log(getText("console.languageDetected", pageLang), pageLang);

  // 3. 拼接API请求URL（包含语言参数）
  const apiUrl = `${API_BASE_URL}?${API_LANG_PARAM}=${pageLang}`;
  if (DEBUG_MODE) console.log(getText("console.apiUrl", pageLang), apiUrl);

  // 4. 根据语言确定界面文本和样式
  const isChinese = pageLang.toLowerCase().startsWith("zh");
  const titleClass = isChinese
    ? "heading-3-light---2col margin-bottom margin-32"
    : "margin-bottom margin-32 partner-title";
  const descriptionClass = isChinese
    ? "text-size-medium-zh text-color-alternate"
    : "text-size-medium";
  const errorText = getText("error.loadFailed", pageLang);

  if (DEBUG_MODE) {
    console.log("🔍 语言检测详情:");
    console.log("   - pageLang:", pageLang);
    console.log("   - isChinese:", isChinese);
    console.log("   - titleClass:", titleClass);
    console.log("   - descriptionClass:", descriptionClass);
  }

  // 5. 定义渲染函数
  function renderPartners(partnersData) {
    if (DEBUG_MODE)
      console.log(
        getText("console.startRender", pageLang),
        partnersData.length
      );

    // 创建虚拟容器
    const fragment = document.createDocumentFragment();

    // 遍历合作伙伴数据
    partnersData.forEach((partnerItem, index) => {
      if (DEBUG_MODE)
        console.log(`🤝 渲染第${index + 1}个合作伙伴:`, partnerItem);

      // 创建合作伙伴卡片容器
      const partnerCard = document.createElement("div");
      partnerCard.className = "card-l";

      // 创建左侧logo区域
      const logoLeft = document.createElement("div");
      logoLeft.className = "card-l-left";

      // 创建logo图片
      const logoImage = document.createElement("img");
      logoImage.loading = "lazy";
      logoImage.src = partnerItem[API_FIELDS_MAP.logo] || "";
      logoImage.alt = `${partnerItem[API_FIELDS_MAP.name] || ""} Logo`;
      logoImage.className = "image";

      logoLeft.appendChild(logoImage);

      // 创建右侧内容区域
      const contentRight = document.createElement("div");
      contentRight.className = "card-l-right";

      // 创建合作伙伴名称标题元素
      const partnerName = document.createElement("h1");
      partnerName.className = titleClass;
      partnerName.textContent = partnerItem[API_FIELDS_MAP.name] || "";

      // 创建合作伙伴描述的容器
      const partnerDescription = document.createElement("div");
      partnerDescription.className = descriptionClass;

      //创建合作伙伴描述的内容
      partnerDescription.innerHTML =
        partnerItem[API_FIELDS_MAP.description] || "";

      // 重置内部所有元素的样式，使其继承父容器的样式类
      const innerElements = partnerDescription.querySelectorAll("*");
      innerElements.forEach((element) => {
        // 重置所有内部元素的样式
        element.style.margin = "0";
        element.style.padding = "0";
        element.style.fontSize = "inherit";
        element.style.fontFamily = "inherit";
        element.style.fontWeight = "inherit";
        element.style.lineHeight = "inherit";
        element.style.color = "inherit";
        element.style.textAlign = "inherit";
      });

      // 组装右侧内容
      contentRight.appendChild(partnerName);
      contentRight.appendChild(partnerDescription);

      // 组装整个卡片
      partnerCard.appendChild(logoLeft);
      partnerCard.appendChild(contentRight);

      // 将卡片添加到文档片段
      fragment.appendChild(partnerCard);
    });

    // 清空容器内的现有内容（静态卡片）
    partnerContainer.innerHTML = "";
    // 将动态生成的卡片添加到容器中
    partnerContainer.appendChild(fragment);
    if (DEBUG_MODE) console.log(getText("console.renderComplete", pageLang));
  }

  // 6. 从后端获取数据
  if (DEBUG_MODE) console.log(getText("console.startRequest", pageLang));
  fetch(apiUrl)
    .then((response) => {
      if (DEBUG_MODE) {
        console.log(getText("console.apiResponse", pageLang));
        console.log("   - 状态码:", response.status);
        console.log("   - 状态文本:", response.statusText);
        console.log("   - Content-Type:", response.headers.get("content-type"));
        console.log("   - 响应URL:", response.url);
      }

      // 检查服务器响应是否成功 (HTTP状态码 200-299)
      if (!response.ok) {
        // 如果不成功，则抛出一个错误，这个错误会被下面的 .catch() 捕获
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 将响应体解析为JSON
      return response.json();
    })
    .then((data) => {
      if (DEBUG_MODE) {
        console.log(getText("console.apiData", pageLang));
        console.log("   - 数据类型:", typeof data);
        console.log("   - 是否为数组:", Array.isArray(data));
        console.log("   - 数据长度:", data?.length);
        console.log("   - 完整数据:", data);
      }

      // 处理API返回的标准格式 {code: 0, message: '请求成功', data: [...]}
      let partnersData = data;

      // 如果返回的是包含data字段的对象，提取data字段
      if (data && typeof data === "object" && data.hasOwnProperty("data")) {
        if (DEBUG_MODE) console.log("🔄 检测到标准API格式，提取data字段");
        partnersData = data.data;
        if (DEBUG_MODE) {
          console.log("   - 提取的合作伙伴数据:", partnersData);
          console.log("   - 合作伙伴数量:", partnersData?.length);
        }
      }

      // 成功获取并解析数据后，调用渲染函数
      if (
        partnersData &&
        Array.isArray(partnersData) &&
        partnersData.length > 0
      ) {
        if (DEBUG_MODE) console.log("✅ 开始渲染合作伙伴数据");
        renderPartners(partnersData);
      } else {
        if (DEBUG_MODE) console.log(getText("console.noValidData", pageLang));
        // API返回了空数组或无效数据
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = getText("status.noPartners", pageLang);
        noDataMessage.style.textAlign = "center";
        noDataMessage.style.padding = "40px 0";
        noDataMessage.style.width = "100%";

        partnerContainer.innerHTML = "";
        partnerContainer.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      if (DEBUG_MODE)
        console.error(getText("console.requestFailed", pageLang), error);

      // 显示错误信息给用户
      const errorMessage = document.createElement("p");
      errorMessage.textContent = errorText;
      errorMessage.style.textAlign = "center";
      errorMessage.style.padding = "40px 0";
      errorMessage.style.color = "#ff6b6b";
      errorMessage.style.width = "100%";

      partnerContainer.innerHTML = "";
      partnerContainer.appendChild(errorMessage);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  /**
   * -------------------------------------------------------------
   * 配置区域
   * -------------------------------------------------------------
   */

  // --- 调试开关 ---
  const DEBUG_MODE = false; // 设置为 true 启用调试输出，false 禁用

  // 1. 获取新闻列表的容器元素
  const newsContainer = document.getElementById("section-news");
  if (!newsContainer) {
    if (DEBUG_MODE) console.error("新闻容器 #section-news 未找到！");
    return;
  }

  if (DEBUG_MODE) console.log("✅ 找到新闻容器:", newsContainer);

  // --- 配置API信息 ---
  const API_BASE_URL = "https://api.pnefamily.com/api/index/newsList"; //API地址
  const API_LANG_PARAM = "lang"; // 后端设置的语言参数名称

  //--- !!! API字段映射 ---
  const API_FIELDS_MAP = {
    id: "id",
    title: "newsTitle",
    image: "newsPhoto",
    // srcset: {
    //   url: "url",
    //   width: "width",
    // },
    // link: "link",
    date: "newsDate",
  };

  // 2. 检测页面语言
  const pageLang = document.documentElement.lang || "zh"; // 默认为 'zh'
  if (DEBUG_MODE) console.log("🌐 检测到页面语言:", pageLang);

  // 3. 拼接API请求URL（包含语言参数）
  const apiUrl = `${API_BASE_URL}?${API_LANG_PARAM}=${pageLang}`;
  if (DEBUG_MODE) console.log("🔗 API请求URL:", apiUrl);

  // 4. 根据语言确定界面文本和样式
  const isChinese = pageLang.toLowerCase().startsWith("zh");
  const buttonText = isChinese ? "了解更多" : "Learn More";
  const titleClass = isChinese
    ? "news-highlight-title-zh"
    : "news-highlight-title-en";
  const errorText = isChinese
    ? "新闻加载失败，请稍后重试。"
    : "Failed to load news. Please try again later.";

  // 5. 定义渲染函数
  function renderNews(newsData) {
    if (DEBUG_MODE) console.log("🎨 开始渲染新闻数据，数量:", newsData.length);
    //创建虚拟容器
    const fragment = document.createDocumentFragment();
    // 遍历新闻数据
    newsData.forEach((newsItem, index) => {
      if (DEBUG_MODE) console.log(`📰 渲染第${index + 1}条新闻:`, newsItem);

      // 创建 <a class="news-container...">
      const link = document.createElement("a");
      // 前端构建新闻详情链接
      link.href = `news-detail.html?id=${newsItem[API_FIELDS_MAP.id]}`;
      link.className = "news-container w-inline-block";

      // 创建图片包装器 <div class="news-highlight-image-wrapper">
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "news-highlight-image-wrapper";

      // 创建图片 <img>
      const image = document.createElement("img");
      image.src = newsItem[API_FIELDS_MAP.image];
      image.alt = newsItem[API_FIELDS_MAP.title]; // 使用标题作为alt文本
      image.loading = "lazy";
      image.className = "news-highlight-image";

      // 暂时没有srcset数据，注释掉响应式图片处理
      // if (
      //   newsItem[API_FIELDS_MAP.srcset] &&
      //   newsItem[API_FIELDS_MAP.srcset].length > 0
      // ) {
      //   const srcsetString = newsItem[API_FIELDS_MAP.srcset]
      //     .map(
      //       (item) =>
      //         `${item[API_FIELDS_MAP.srcset.url]} ${
      //           item[API_FIELDS_MAP.srcset.width]
      //         }w`
      //     )
      //     .join(", ");
      //   image.srcset = srcsetString;
      //   image.sizes = "(max-width: 1600px) 100vw, 1600px"; // 根据设计调整
      // }

      imageWrapper.appendChild(image);

      // 创建新闻信息 <div class="news-info">
      const infoDiv = document.createElement("div");
      infoDiv.className = "news-info";

      // 创建标题包装器 <div class="news-title-wrapper">
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "news-title-wrapper";

      // 创建日期 <p class="news-release-date">
      const dateP = document.createElement("p");
      dateP.className = "news-release-date";
      dateP.textContent = newsItem[API_FIELDS_MAP.date];

      // 创建标题 <h6 class="...">
      const titleH6 = document.createElement("h6");
      titleH6.className = titleClass; // 使用动态的class，根据语言切换类名
      titleH6.textContent = newsItem[API_FIELDS_MAP.title];

      titleWrapper.appendChild(dateP);
      titleWrapper.appendChild(titleH6);

      // 创建按钮组 <div class="button-group">
      const buttonGroup = document.createElement("div");
      buttonGroup.className = "button-group";

      const button = document.createElement("div");
      button.className = "button stroke-green icon";

      const buttonTextDiv = document.createElement("div");
      buttonTextDiv.className = "text-block-13";
      buttonTextDiv.textContent = buttonText;

      const buttonIconWrapper = document.createElement("div");
      buttonIconWrapper.className = "button-icon-wrapper green";

      const buttonIcon = document.createElement("img");
      buttonIcon.loading = "lazy";
      buttonIcon.src = "../images/Arrow-Button.svg";
      buttonIcon.alt = "arrow button";
      buttonIcon.className = "invert-color";

      buttonIconWrapper.appendChild(buttonIcon);
      button.appendChild(buttonTextDiv);
      button.appendChild(buttonIconWrapper);
      buttonGroup.appendChild(button);

      // 组装所有元素
      infoDiv.appendChild(titleWrapper);
      infoDiv.appendChild(buttonGroup);

      link.appendChild(imageWrapper);
      link.appendChild(infoDiv);

      // 将最终的新闻卡片添加到容器中
      fragment.appendChild(link);
    });
    // 清空容器 (移除 "加载中..." 的提示)
    newsContainer.innerHTML = "";
    // 将虚拟容器添加到真实容器中
    newsContainer.appendChild(fragment);
    if (DEBUG_MODE) console.log("✅ 新闻渲染完成");
  }

  // 6. 从后端获取数据
  if (DEBUG_MODE) console.log("🚀 开始请求API数据...");
  fetch(apiUrl)
    .then((response) => {
      if (DEBUG_MODE) {
        console.log("📡 收到API响应:");
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
        console.log("📊 API返回数据:");
        console.log("   - 数据类型:", typeof data);
        console.log("   - 是否为数组:", Array.isArray(data));
        console.log("   - 数据长度:", data?.length);
        console.log("   - 完整数据:", data);
      }

      // 处理API返回的标准格式 {code: 0, message: '请求成功', data: [...]}
      let newsData = data;

      // 如果返回的是包含data字段的对象，提取data字段
      if (data && typeof data === "object" && data.hasOwnProperty("data")) {
        if (DEBUG_MODE) console.log("🔄 检测到标准API格式，提取data字段");
        newsData = data.data;
        if (DEBUG_MODE) {
          console.log("   - 提取的新闻数据:", newsData);
          console.log("   - 新闻数量:", newsData?.length);
        }
      }

      // 成功获取并解析数据后，调用渲染函数
      if (newsData && Array.isArray(newsData) && newsData.length > 0) {
        if (DEBUG_MODE) console.log("✅ 开始渲染新闻数据");
        renderNews(newsData);
      } else {
        if (DEBUG_MODE) console.log("⚠️ 没有找到有效的新闻数据");
        // API返回了空数组或无效数据
        newsContainer.innerHTML = `<p>${
          isChinese ? "暂无新闻" : "No news available"
        }</p>`;
      }
    })
    .catch((error) => {
      // 捕获网络请求过程中的任何错误 (如网络中断、DNS问题、服务器错误等)
      if (DEBUG_MODE) {
        console.error("❌ 获取新闻数据失败:");
        console.error("   - 错误类型:", error.name);
        console.error("   - 错误信息:", error.message);
        console.error("   - 完整错误:", error);
      }

      // 在页面上向用户显示错误信息
      newsContainer.innerHTML = `<p style="text-align: center; color: red;">${errorText}</p>`;
    });
});

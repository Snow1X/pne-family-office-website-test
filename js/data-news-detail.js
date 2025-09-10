document.addEventListener("DOMContentLoaded", () => {
  /**
   * -------------------------------------------------------------
   * 配置区域
   * -------------------------------------------------------------
   */

  // --- 调试开关 ---
  const DEBUG_MODE = false; // 设置为 true 启用调试输出，false 禁用

  // --- 配置API信息 ---
  const API_BASE_URL = "https://api.pnefamily.com/api/index/newsDetail"; // API地址
  const API_LANG_PARAM = "lang"; // 后端设置的语言参数名称

  // --- 多语言文本配置 ---
  const LANGUAGES = {
    zh: {
      // 错误信息
      error: {
        invalidUrl: "无效的访问链接，无法加载新闻。",
        loadFailed: "新闻加载失败，请稍后重试。",
        contentLoadFailed: "内容加载失败。",
        noNewsId: "错误：无法从URL中解析新闻ID。",
      },
      // 控制台日志
      console: {
        fetchingNews: "正在从API获取新闻详情:",
        noNewsId: "错误：无法从URL中解析新闻ID。",
      },
      // 加载状态
      loading: {
        fetchingNews: "正在加载新闻详情...",
      },
    },
    en: {
      // 错误信息
      error: {
        invalidUrl: "Invalid access link, unable to load news.",
        loadFailed: "News loading failed, please try again later.",
        contentLoadFailed: "Content loading failed.",
        noNewsId: "Error: Unable to parse news ID from URL.",
      },
      // 控制台日志
      console: {
        fetchingNews: "Fetching news details from API:",
        noNewsId: "Error: Unable to parse news ID from URL.",
      },
      // 加载状态
      loading: {
        fetchingNews: "Loading news details...",
      },
    },
  };

  // --- !!! API字段映射 ---
  const API_FIELDS_MAP = {
    title: "newsTitle",
    publishDate: "newsDate",
    imageAlt: "newsTitle", // 使用新闻标题作为图片alt文本
    mainImage: "newsPhoto",
    contentHtml: "newsDetail",
    // // 嵌套的图片字段 - 暂时注释
    // image: {
    //   defaultSrc: "newsPhoto",
    //   srcset: "srcset",
    //   srcsetUrl: "url",
    //   srcsetWidth: "width",
    // },
  };

  /**
   * -------------------------------------------------------------
   * 主逻辑区域
   * -------------------------------------------------------------
   */

  // 获取页面上的关键元素
  const elements = {
    image: document.querySelector(".news-head-img"),
    title: document.querySelector(".news-title"),
    date: document.querySelector(".news-release-date"),
    contentContainer: document.querySelector(".news-text-content"),
    errorContainer: document.querySelector(".section-news"), // 用于显示错误信息
  };

  // 1. 解析新闻ID--->按照后端提供的url格式更改
  let newsId = null;
  const params = new URLSearchParams(window.location.search);
  newsId = params.get("id"); // 优先尝试从 ?id=123 获取

  if (!newsId) {
    // 如果URL中没有 ?id=...，尝试从路径中解析，例如 /news/123
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(parseInt(lastPart, 10))) {
      newsId = lastPart;
    }
  }

  // 2. 检测页面语言
  const pageLang = document.documentElement.lang || "zh";
  const isChinese = pageLang.toLowerCase().startsWith("zh");

  // 3. 如果没有有效的ID，则停止执行并显示错误
  if (!newsId) {
    if (DEBUG_MODE) {
      console.error(getText("console.noNewsId", pageLang));
      console.error("Current URL:", window.location.href);
      console.error("URL search params:", window.location.search);
    }
    displayError(getText("error.invalidUrl", pageLang));
    return;
  }

  // 调试信息：显示解析到的newsId
  if (DEBUG_MODE) {
    console.log("Parsed newsId:", newsId);
    console.log("Page language:", pageLang);
    console.log("Current URL:", window.location.href);
  }

  // 4. 发起API请求获取新闻数据
  fetchNewsDetail(newsId, pageLang);

  /**
   * 显示加载状态
   * @param {string} lang 语言代码
   */
  function showLoadingState(lang) {
    const loadingMessage = getText("loading.fetchingNews", lang);

    // 不要替换整个区域，只修改相关元素的内容
    if (elements.title) {
      elements.title.textContent = loadingMessage;
    }
    if (elements.date) {
      elements.date.textContent = "-";
    }
    if (elements.contentContainer) {
      elements.contentContainer.innerHTML = `
        <div style="
          min-height: 200px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          width: 100%; 
          text-align: center;
          color: #666;
          font-size: 16px;
        ">
          ${loadingMessage}
        </div>
      `;
    }
  }

  /**
   * 根据语言获取对应的文本
   * @param {string} key 文本键值，支持点号分隔的嵌套结构
   * @param {string} lang 语言代码
   * @returns {string} 对应语言的文本
   */
  function getText(key, lang) {
    const langData = LANGUAGES[lang] || LANGUAGES.zh; // 默认使用中文
    const keys = key.split(".");
    let result = langData;

    for (const k of keys) {
      if (result && typeof result === "object" && result[k] !== undefined) {
        result = result[k];
      } else {
        // 如果找不到对应的文本，返回中文版本作为后备
        const zhResult = LANGUAGES.zh;
        for (const zhKey of keys) {
          if (
            zhResult &&
            typeof zhResult === "object" &&
            zhResult[zhKey] !== undefined
          ) {
            zhResult = zhResult[zhKey];
          } else {
            return key; // 如果连中文都找不到，返回键值本身
          }
        }
        return zhResult;
      }
    }

    return result || key;
  }

  /**
   * 请求API以获取新闻详情
   * @param {string} id 新闻ID
   * @param {string} lang 语言代码 (例如 'zh' 或 'en')
   */
  async function fetchNewsDetail(id, lang) {
    const apiUrl = `${API_BASE_URL}?${API_LANG_PARAM}=${lang}&news_id=${id}`;
    if (DEBUG_MODE) {
      console.log(`${getText("console.fetchingNews", lang)} ${apiUrl}`);
      console.log("Making API request with parameters:", { id, lang });
    }

    // 显示加载状态
    showLoadingState(lang);

    try {
      if (DEBUG_MODE) console.log("Sending fetch request...");
      const response = await fetch(apiUrl);
      if (DEBUG_MODE) {
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
      }

      if (!response.ok) {
        throw new Error(`网络错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (DEBUG_MODE) {
        console.log("API response data:", data);
      }

      // 数据获取成功，渲染到页面
      renderNewsDetail(data, lang);
    } catch (error) {
      if (DEBUG_MODE) {
        console.error("获取新闻详情失败:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      displayError(getText("error.loadFailed", lang));
    }
  }

  /**
   * 将获取到的数据渲染到HTML页面上
   * @param {object} apiResponse 从API获取的响应数据对象
   * @param {string} lang 语言代码
   */
  function renderNewsDetail(apiResponse, lang) {
    if (DEBUG_MODE) {
      console.log("Rendering news detail with data:", apiResponse);
      console.log("Language:", lang);
    }

    // 提取data字段中的实际新闻数据
    const newsData = apiResponse.data || {};

    if (DEBUG_MODE) {
      console.log("Extracted news data:", newsData);
      console.log("Available data fields:", Object.keys(newsData));
    }

    // 检测是否为中文 - 使用已有的变量
    // const isChinese = lang.toLowerCase().startsWith("zh");

    if (DEBUG_MODE) {
      console.log("Elements found:", {
        title: !!elements.title,
        date: !!elements.date,
        contentContainer: !!elements.contentContainer,
        image: !!elements.image,
      });
    }

    // 检查关键元素是否存在
    if (!elements.title || !elements.date || !elements.contentContainer) {
      if (DEBUG_MODE) {
        console.error("Critical elements not found!", {
          title: elements.title,
          date: elements.date,
          contentContainer: elements.contentContainer,
        });
      }
      displayError(getText("error.contentLoadFailed", lang));
      return;
    }

    // 使用 textContent 填充纯文本内容，可以防止XSS攻击
    elements.title.textContent = newsData[API_FIELDS_MAP.title] || "";
    elements.date.textContent = newsData[API_FIELDS_MAP.publishDate] || "";
    // 更新浏览器标签页的标题，提升用户体验
    document.title = newsData[API_FIELDS_MAP.title] || document.title;

    if (DEBUG_MODE) {
      console.log("Content updated:", {
        title: elements.title.textContent,
        date: elements.date.textContent,
      });
    }

    // 根据语言动态设置标题样式
    if (isChinese) {
      elements.title.className = "news-title";
    } else {
      elements.title.className = "news-title en-style";
    }

    // 使用 innerHTML 填充富文本内容，因为新闻正文需要显示HTML格式
    // 警告：请确保您完全信任后端API返回的HTML内容，以防止XSS攻击。
    const contentHtml =
      newsData[API_FIELDS_MAP.contentHtml] ||
      `<p>${getText("error.contentLoadFailed", lang)}</p>`;

    if (DEBUG_MODE) {
      console.log("Content HTML length:", contentHtml.length);
      console.log(
        "Content HTML preview:",
        contentHtml.substring(0, 100) + "..."
      );
    }

    elements.contentContainer.innerHTML = contentHtml;

    if (DEBUG_MODE) {
      console.log(
        "Content container updated, innerHTML length:",
        elements.contentContainer.innerHTML.length
      );
    }

    // 根据语言为内容区域的富文本元素动态设置字体样式，但移除可能的margin样式
    const textElements = elements.contentContainer.querySelectorAll(
      "p, div, span, h1, h2, h3, h4, h5, h6, li"
    );
    textElements.forEach((element) => {
      if (isChinese) {
        // 使用中文字体样式，但移除可能影响间距的class
        element.className = "text-size-medium-zh text-color-black";
        // 移除可能的margin样式，让富文本内容保持原有间距
        element.style.margin = "";
      } else {
        // 使用英文字体样式，但移除可能影响间距的class
        element.className = "text-size-regular";
        // 移除可能的margin样式，让富文本内容保持原有间距
        element.style.margin = "";
      }
    });

    // --- 处理图片 ---
    const imageUrl = newsData[API_FIELDS_MAP.mainImage];
    if (DEBUG_MODE) {
      console.log("Processing image:", {
        imageUrl: imageUrl,
        hasImageElement: !!elements.image,
      });
    }

    if (imageUrl && elements.image) {
      // 设置alt文本，使用新闻标题作为alt
      elements.image.alt = newsData[API_FIELDS_MAP.title] || "";

      // 设置图片src
      elements.image.src = imageUrl;

      if (DEBUG_MODE) {
        console.log("Image updated:", {
          src: elements.image.src,
          alt: elements.image.alt,
        });
      }

      // 由于API返回的是直接的图片URL，不需要处理复杂的srcset
      // 如果需要响应式图片，可以根据实际需求添加
    } else if (DEBUG_MODE) {
      console.warn("Image not processed:", {
        imageUrl: imageUrl,
        hasImageElement: !!elements.image,
      });
    }

    if (DEBUG_MODE) {
      console.log("News detail rendering completed successfully!");
    }
  }

  /**
   * 在页面上显示错误信息
   * @param {string} message 要显示的错误文本
   */
  function displayError(message) {
    if (elements.errorContainer) {
      elements.errorContainer.innerHTML = `<div style="padding: 50px; text-align: center; color: red;">${message}</div>`;
    }
  }
});

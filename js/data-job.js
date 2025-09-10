document.addEventListener("DOMContentLoaded", function () {
  /**
   * -------------------------------------------------------------
   * 配置区域
   * -------------------------------------------------------------
   */

  // --- 调试开关 ---
  const DEBUG_MODE = false; // 设置为 true 启用调试输出，false 禁用

  // --- 配置API信息 ---
  const API_BASE_URL = "https://api.pnefamily.com/api/index/jobList"; // API地址
  const API_LANG_PARAM = "lang"; // 后端设置的语言参数名称

  // --- API字段映射 ---
  const API_FIELDS_MAP = {
    title: "jobTitle",
    location: "jobLocation",
    type: "jobType",
    description: "jobDescription",
  };

  // --- 多语言文本配置 ---
  const LANGUAGES = {
    zh: {
      // 错误信息
      error: {
        loadFailed: "招聘信息加载失败，请稍后重试。",
        containerNotFound: "招聘容器未找到！",
      },
      // 状态文本
      status: {
        noJobs: "暂无招聘信息",
        loading: "正在加载招聘信息...",
      },
      // // 控制台日志
      // console: {
      //   containerFound: "✅ 找到招聘容器:",
      //   languageDetected: "🌐 检测到页面语言:",
      //   apiUrl: "🔗 API请求URL:",
      //   startRequest: "🚀 开始请求API数据...",
      //   apiResponse: "📡 收到API响应:",
      //   apiData: "📊 API返回数据:",
      //   startRender: "🎨 开始渲染招聘数据，数量:",
      //   renderComplete: "✅ 招聘信息渲染完成",
      //   noValidData: "⚠️ 没有找到有效的招聘数据",
      //   requestFailed: "❌ 获取招聘数据失败:",
      // },
    },
    en: {
      // 错误信息
      error: {
        loadFailed: "Failed to load job listings. Please try again later.",
        containerNotFound: "Job container not found!",
      },
      // 状态文本
      status: {
        noJobs: "No job openings available",
        loading: "Loading job listings...",
      },
      // 控制台日志
      // console: {
      //   containerFound: "✅ Job container found:",
      //   languageDetected: "🌐 Page language detected:",
      //   apiUrl: "🔗 API request URL:",
      //   startRequest: "🚀 Starting API request...",
      //   apiResponse: "📡 API response received:",
      //   apiData: "📊 API data returned:",
      //   startRender: "🎨 Starting to render job data, count:",
      //   renderComplete: "✅ Job listings render complete",
      //   noValidData: "⚠️ No valid job data found",
      //   requestFailed: "❌ Failed to fetch job data:",
      // },
    },
  };

  /**
   * -------------------------------------------------------------
   * 主要逻辑
   * -------------------------------------------------------------
   */

  // 1. 获取招聘列表的容器元素
  const jobContainer = document.querySelector(".job-wrapper");
  if (!jobContainer) {
    if (DEBUG_MODE) console.error(getText("error.containerNotFound", "zh"));
    return;
  }

  if (DEBUG_MODE)
    console.log(getText("console.containerFound", "zh"), jobContainer);

  // 2. 检测页面语言
  const pageLang = document.documentElement.lang || "zh"; // 默认为 'zh'
  if (DEBUG_MODE)
    console.log(getText("console.languageDetected", pageLang), pageLang);

  // 3. 拼接API请求URL（包含语言参数）
  const apiUrl = `${API_BASE_URL}?${API_LANG_PARAM}=${pageLang}`;
  if (DEBUG_MODE) console.log(getText("console.apiUrl", pageLang), apiUrl);

  // 4. 根据语言确定界面文本和样式
  const isChinese = pageLang.toLowerCase().startsWith("zh");
  const titleClass = isChinese ? "text-size-medium-zh-bold" : "paragraph-5";
  const descriptionClass = isChinese
    ? "text-size-medium-zh"
    : "text-size-regular";
  const errorText = getText("error.loadFailed", pageLang);

  if (DEBUG_MODE) {
    console.log("🔍 语言检测详情:");
    console.log("   - pageLang:", pageLang);
    console.log("   - isChinese:", isChinese);
    console.log("   - titleClass:", titleClass);
    console.log("   - descriptionClass:", descriptionClass);
  }

  // 临时使用静态测试数据以便调试
  const testJobData = [
    {
      jobTitle: isChinese ? "高级投资分析师" : "Senior Investment Analyst",
      jobLocation: isChinese ? "悉尼" : "Sydney",
      jobType: isChinese ? "全职" : "Full-time",
      jobDescription: isChinese
        ? "负责投资项目的尽职调查和风险评估工作，为投资决策提供专业支持。"
        : "Responsible for due diligence and risk assessment of investment projects, providing professional support for investment decisions.",
    },
    {
      jobTitle: isChinese ? "财务规划师" : "Financial Planner",
      jobLocation: isChinese ? "墨尔本" : "Melbourne",
      jobType: isChinese ? "全职" : "Full-time",
      jobDescription: isChinese
        ? "为高净值客户提供个性化的财富管理和投资规划服务。"
        : "Provide personalized wealth management and investment planning services for high-net-worth clients.",
    },
  ];

  // 5. 定义渲染函数
  function renderJobs(jobsData) {
    if (DEBUG_MODE)
      console.log(getText("console.startRender", pageLang), jobsData.length);

    // 创建虚拟容器
    const fragment = document.createDocumentFragment();

    // 遍历招聘数据
    jobsData.forEach((jobItem, index) => {
      if (DEBUG_MODE) console.log(`💼 渲染第${index + 1}个职位:`, jobItem);

      // 创建招聘卡片容器
      const jobCard = document.createElement("div");
      jobCard.className = "job-list-component border-primary job-card";
      jobCard.setAttribute("data-target", `job-detail-${index + 1}`);

      // 创建职位标题区域
      const jobTitle = document.createElement("div");
      jobTitle.className = "job-title";

      // 创建左侧信息区域
      const jobInfo = document.createElement("div");
      jobInfo.className = "margin-bottom";

      // 创建职位标题
      const titleElement = document.createElement("h2");
      titleElement.className = "job-heading margin-bottom margin-24";
      titleElement.textContent = jobItem[API_FIELDS_MAP.title] || "";

      // 创建职位类型和地点信息
      const jobMeta = document.createElement("div");
      jobMeta.className = titleClass;
      const jobType = jobItem[API_FIELDS_MAP.type] || "";
      const jobLocation = jobItem[API_FIELDS_MAP.location] || "";
      jobMeta.textContent = `${jobType} ｜ ${
        isChinese ? "工作地点：" : "Work location: "
      }${jobLocation}`;

      // 组装左侧信息
      jobInfo.appendChild(titleElement);
      jobInfo.appendChild(jobMeta);

      // 创建右侧按钮
      const toggleButton = document.createElement("div");
      toggleButton.className = "button icon-only job-toggle-indicator";

      const buttonIcon = document.createElement("img");
      buttonIcon.loading = "lazy";
      buttonIcon.src = isChinese
        ? "../images/Icon-Plus.svg"
        : "images/Icon-Plus.svg";
      buttonIcon.alt = "plus button";
      buttonIcon.className = "button-icon xsmall";

      toggleButton.appendChild(buttonIcon);

      // 组装标题区域
      jobTitle.appendChild(jobInfo);
      jobTitle.appendChild(toggleButton);

      // 创建详情容器
      const detailContainer = document.createElement("div");
      detailContainer.className = "job-detail-container collapsed";
      detailContainer.id = `job-detail-${index + 1}`;

      // 创建详情包装器
      const detailWrapper = document.createElement("div");
      detailWrapper.className = "job-detail-wrapper";

      // 创建职位描述区域
      const jobDescribe = document.createElement("div");
      jobDescribe.className = "job-describe";

      // 创建描述内容
      const descContent = document.createElement("div");
      descContent.className = `${descriptionClass} margin-top-auto`;

      // 处理富文本内容
      const description = jobItem[API_FIELDS_MAP.description] || "";
      if (description.includes("<p>") || description.includes("<br>")) {
        // 如果是HTML格式，直接使用innerHTML
        descContent.innerHTML = description;
      } else {
        // 如果是纯文本，处理换行符
        const formattedDescription = description
          .replace(/\r\n/g, "<br>")
          .replace(/\n/g, "<br>");
        descContent.innerHTML = formattedDescription;
      }

      // 组装描述区域（不再添加标题）
      jobDescribe.appendChild(descContent);
      detailWrapper.appendChild(jobDescribe);
      detailContainer.appendChild(detailWrapper);

      // 组装完整卡片
      jobCard.appendChild(jobTitle);
      jobCard.appendChild(detailContainer);

      // 添加到虚拟容器
      fragment.appendChild(jobCard);
    });

    // 清空容器并添加新内容
    jobContainer.innerHTML = "";
    jobContainer.appendChild(fragment);

    // 重新绑定点击事件（因为是动态生成的元素）
    bindJobCardEvents();

    if (DEBUG_MODE) console.log(getText("console.renderComplete", pageLang));
  }

  // 6. 绑定卡片点击事件
  function bindJobCardEvents() {
    if (DEBUG_MODE) console.log("🎯 开始绑定卡片点击事件");
    const jobCards = document.querySelectorAll(".job-card");
    if (DEBUG_MODE) console.log("   - 找到的卡片数量:", jobCards.length);

    jobCards.forEach((card, index) => {
      if (DEBUG_MODE) console.log(`   - 为第${index + 1}个卡片绑定事件`);
      card.addEventListener("click", function (event) {
        if (DEBUG_MODE) console.log("🔥 卡片被点击了!", this);

        const targetId = this.getAttribute("data-target");
        const targetContainer = document.getElementById(targetId);
        const indicator = this.querySelector(".job-toggle-indicator");

        if (DEBUG_MODE) {
          console.log("   - targetId:", targetId);
          console.log("   - targetContainer:", targetContainer);
          console.log("   - indicator:", indicator);
        }

        if (targetContainer && targetContainer.classList.contains("expanded")) {
          // 收起卡片
          if (DEBUG_MODE) console.log("   ↗️ 收起卡片");
          targetContainer.classList.remove("expanded");
          targetContainer.classList.add("collapsed");
          if (indicator) indicator.classList.remove("rotated");

          // 平滑滚动到卡片顶部
          setTimeout(() => {
            const cardElement = this;
            if (typeof $ !== "undefined") {
              // 如果jQuery可用
              $("html, body").animate(
                {
                  scrollTop: $(cardElement).offset().top - 100,
                },
                600
              );
            } else {
              // 原生JavaScript实现
              cardElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 100);
        } else if (targetContainer) {
          // 展开卡片
          if (DEBUG_MODE) console.log("   ↘️ 展开卡片");
          targetContainer.classList.remove("collapsed");
          targetContainer.classList.add("expanded");
          if (indicator) indicator.classList.add("rotated");
        }

        // 阻止事件冒泡
        event.stopPropagation();
      });
    });

    if (DEBUG_MODE) console.log("✅ 事件绑定完成");
  }

  // 7. 从后端获取数据
  if (DEBUG_MODE) console.log(getText("console.startRequest", pageLang));

  // 显示加载状态
  jobContainer.innerHTML = `<p style="text-align: center;">${getText(
    "status.loading",
    pageLang
  )}</p>`;

  fetch(apiUrl)
    .then((response) => {
      if (DEBUG_MODE) {
        console.log(getText("console.apiResponse", pageLang));
        console.log("   - 状态码:", response.status);
        console.log("   - 状态文本:", response.statusText);
        console.log("   - Content-Type:", response.headers.get("content-type"));
        console.log("   - 响应URL:", response.url);
      }

      // 检查服务器响应是否成功
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      let jobsData = data;

      // 如果返回的是包含data字段的对象，提取data字段
      if (data && typeof data === "object" && data.hasOwnProperty("data")) {
        if (DEBUG_MODE) console.log("🔄 检测到标准API格式，提取data字段");
        jobsData = data.data;
        if (DEBUG_MODE) {
          console.log("   - 提取的招聘数据:", jobsData);
          console.log("   - 职位数量:", jobsData?.length);
        }
      }

      // 成功获取并解析数据后，调用渲染函数
      if (jobsData && Array.isArray(jobsData) && jobsData.length > 0) {
        if (DEBUG_MODE) console.log("✅ 开始渲染招聘数据");
        renderJobs(jobsData);
      } else {
        if (DEBUG_MODE) console.log(getText("console.noValidData", pageLang));
        // API返回了空数组或无效数据
        jobContainer.innerHTML = `<p style="text-align: center;">${getText(
          "status.noJobs",
          pageLang
        )}</p>`;
      }
    })
    .catch((error) => {
      // 捕获网络请求过程中的任何错误
      if (DEBUG_MODE) {
        console.error(getText("console.requestFailed", pageLang));
        console.error("   - 错误类型:", error.name);
        console.error("   - 错误信息:", error.message);
        console.error("   - 完整错误:", error);
      }

      // 在页面上向用户显示错误信息
      jobContainer.innerHTML = `<p style="text-align: center; color: red;">${errorText}</p>`;

      // 如果API失败，回退到测试数据以确保功能可用
      if (DEBUG_MODE) console.log("🔄 API失败，使用测试数据确保功能可用");
      setTimeout(() => {
        renderJobs(testJobData);
      }, 1000);
    });

  // 临时使用静态测试数据以便调试 - 已移除，现在使用真实API

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
        let zhResult = LANGUAGES.zh;
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
});

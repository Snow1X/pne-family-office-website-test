document.addEventListener("DOMContentLoaded", function () {
  /**
   * -------------------------------------------------------------
   * 配置区域
   * -------------------------------------------------------------
   */

  // --- 调试开关 ---
  const DEBUG_MODE = false; // 设置为 true 启用调试输出，false 禁用

  // ================== 双语机制配置 ==================

  // 检测页面语言
  const pageLang = document.documentElement.lang || "zh"; // 默认为 'zh'
  if (DEBUG_MODE) console.log("🌐 检测到页面语言:", pageLang);

  // 根据语言确定界面文本和样式
  const isChinese = pageLang.toLowerCase().startsWith("zh");

  // 定义多语言文本
  const uiTexts = {
    loading: isChinese
      ? "团队信息正在加载中..."
      : "Loading team information...",
    noData: isChinese ? "暂无团队信息" : "No team information available",
    error: isChinese
      ? "团队信息加载失败，请稍后重试。"
      : "Failed to load team information. Please try again later.",
    committeeLoading: isChinese
      ? "投资委员会信息正在加载中..."
      : "Loading investment committee information...",
    committeeNoData: isChinese
      ? "暂无投资委员会信息"
      : "No investment committee information available",
    committeeError: isChinese
      ? "投资委员会信息加载失败，请稍后重试。"
      : "Failed to load investment committee information. Please try again later.",
  };

  // ================== 团队成员渲染逻辑 ==================

  // 1. 获取团队成员容器元素
  const teamContainer = document.querySelector(".team-member-wrapper");
  if (!teamContainer) {
    if (DEBUG_MODE) console.error("团队成员容器 .team-member-wrapper 未找到！");
    return;
  }

  if (DEBUG_MODE) console.log("✅ 找到团队成员容器:", teamContainer);

  // --- 配置团队成员API信息 ---
  const TEAM_API_BASE_URL = "https://api.pnefamily.com/api/index/teamList"; //API地址
  const API_LANG_PARAM = "lang"; // 后端设置的语言参数名称

  //--- API字段映射 ---
  const TEAM_API_FIELDS_MAP = {
    name: "memberName",
    position: "memberPosition",
    image: "teamPhoto",
  };

  // 拼接团队API请求URL（包含语言参数）
  const teamApiUrl = `${TEAM_API_BASE_URL}?${API_LANG_PARAM}=${pageLang}`;
  if (DEBUG_MODE) console.log("🔗 团队API请求URL:", teamApiUrl);

  // 定义团队成员渲染函数
  function renderTeamMembers(teamData) {
    if (DEBUG_MODE)
      console.log("🎨 开始渲染团队成员数据，数量:", teamData.length);

    // 创建虚拟容器
    const fragment = document.createDocumentFragment();

    // 遍历团队成员数据
    teamData.forEach((member, index) => {
      if (DEBUG_MODE) console.log(`👤 渲染第${index + 1}位团队成员:`, member);

      // 创建团队成员项容器 <div class="team-item">
      const teamItem = document.createElement("div");
      teamItem.className = "team-item";

      // 创建图片包装器 <div class="team-image-wrapper">
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "team-image-wrapper";

      // 创建图片 <img>
      const image = document.createElement("img");
      image.src = member[TEAM_API_FIELDS_MAP.image];
      image.alt = member[TEAM_API_FIELDS_MAP.name];
      image.loading = "lazy";
      image.className = "team-image";
      image.sizes = "(max-width: 1181px) 100vw, 1181px";

      imageWrapper.appendChild(image);

      // 创建margin-top容器 <div class="margin-top">
      const marginTopDiv = document.createElement("div");
      marginTopDiv.className = "margin-top";

      // 创建标题包装器 <div class="team-title-wrapper">
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "team-title-wrapper";

      // 创建姓名标题 <div class="heading-style-h6">
      const nameDiv = document.createElement("div");
      nameDiv.className = "heading-style-h6";
      nameDiv.textContent = member[TEAM_API_FIELDS_MAP.name];

      // 创建职位 <div class="text-size-regular">
      const positionDiv = document.createElement("div");
      positionDiv.className = "text-size-regular";
      positionDiv.textContent = member[TEAM_API_FIELDS_MAP.position];

      // 组装标题包装器
      titleWrapper.appendChild(nameDiv);
      titleWrapper.appendChild(positionDiv);

      // 组装margin-top容器
      marginTopDiv.appendChild(titleWrapper);

      // 组装最终的团队成员项
      teamItem.appendChild(imageWrapper);
      teamItem.appendChild(marginTopDiv);

      // 将团队成员项添加到虚拟容器中
      fragment.appendChild(teamItem);
    });

    // 清空容器 (移除 "加载中..." 的提示)
    teamContainer.innerHTML = "";
    // 将虚拟容器添加到真实容器中
    teamContainer.appendChild(fragment);
    if (DEBUG_MODE) console.log("✅ 团队成员渲染完成");
  }

  // 从后端获取团队成员数据
  if (DEBUG_MODE) console.log("🚀 开始请求团队成员API数据...");
  fetch(teamApiUrl)
    .then((response) => {
      if (DEBUG_MODE) {
        console.log("📡 收到团队成员API响应:");
        console.log("   - 状态码:", response.status);
        console.log("   - 状态文本:", response.statusText);
        console.log("   - Content-Type:", response.headers.get("content-type"));
        console.log("   - 响应URL:", response.url);
      }

      // 检查服务器响应是否成功 (HTTP状态码 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 将响应体解析为JSON
      return response.json();
    })
    .then((data) => {
      if (DEBUG_MODE) {
        console.log("📊 团队成员API返回数据:");
        console.log("   - 数据类型:", typeof data);
        console.log("   - 是否为数组:", Array.isArray(data));
        console.log("   - 数据长度:", data?.length);
        console.log("   - 完整数据:", data);
      }

      // 处理API返回的标准格式 {code: 0, message: '请求成功', data: [...]}
      let teamData = data;

      // 如果返回的是包含data字段的对象，提取data字段
      if (data && typeof data === "object" && data.hasOwnProperty("data")) {
        if (DEBUG_MODE) console.log("🔄 检测到标准API格式，提取data字段");
        teamData = data.data;
        if (DEBUG_MODE) {
          console.log("   - 提取的团队数据:", teamData);
          console.log("   - 团队成员数量:", teamData?.length);
        }
      }

      // 成功获取并解析数据后，调用渲染函数
      if (teamData && Array.isArray(teamData) && teamData.length > 0) {
        if (DEBUG_MODE) console.log("✅ 开始渲染团队成员数据");
        renderTeamMembers(teamData);
      } else {
        if (DEBUG_MODE) console.log("⚠️ 没有找到有效的团队成员数据");
        // API返回了空数组或无效数据
        teamContainer.innerHTML = `<p style="text-align: center">${uiTexts.noData}</p>`;
      }
    })
    .catch((error) => {
      // 捕获网络请求过程中的任何错误
      if (DEBUG_MODE) {
        console.error("❌ 获取团队成员数据失败:");
        console.error("   - 错误类型:", error.name);
        console.error("   - 错误信息:", error.message);
        console.error("   - 完整错误:", error);
      }

      // 在页面上向用户显示错误信息
      teamContainer.innerHTML = `<p style="text-align: center; color: red;">${uiTexts.error}</p>`;
    });

  // ================== 投资委员会渲染逻辑 ==================

  // 2. 获取投资委员会容器元素
  const committeeContainer = document.querySelector(".team-content-grid");
  if (!committeeContainer) {
    if (DEBUG_MODE) console.error("投资委员会容器 .team-content-grid 未找到！");
    return;
  }

  if (DEBUG_MODE) console.log("✅ 找到投资委员会容器:", committeeContainer);

  // --- 配置投资委员会API信息 ---
  const COMMITTEE_API_BASE_URL = "https://api.pnefamily.com/api/index/icList"; //API地址

  //--- API字段映射 ---
  const COMMITTEE_API_FIELDS_MAP = {
    name: "icMemberName",
    position: "icMemberPosition",
  };

  // 拼接投资委员会API请求URL（包含语言参数）
  const committeeApiUrl = `${COMMITTEE_API_BASE_URL}?${API_LANG_PARAM}=${pageLang}`;
  if (DEBUG_MODE) console.log("🔗 投资委员会API请求URL:", committeeApiUrl);

  // 定义样式类名
  const positionTextClass = isChinese
    ? "text-m-zh-center"
    : "text-size-regular";

  // 定义投资委员会渲染函数
  function renderCommitteeMembers(committeeData) {
    if (DEBUG_MODE)
      console.log("🎨 开始渲染投资委员会数据，数量:", committeeData.length);

    // 创建虚拟容器
    const fragment = document.createDocumentFragment();

    // 遍历投资委员会数据
    committeeData.forEach((member, index) => {
      if (DEBUG_MODE)
        console.log(`👔 渲染第${index + 1}位投资委员会成员:`, member);

      // 创建投资委员会成员项容器 <div class="card-style-dark-line">
      const committeeItem = document.createElement("div");
      committeeItem.className = "card-style-dark-line";

      // 为每个项目添加唯一的节点ID
      committeeItem.id = `w-node-committee-${index + 1}-842b394a`;

      // 创建标题包装器 <div class="consule-title-wrapper">
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "consule-title-wrapper";

      // 创建姓名标题 <div class="heading-style-h6">
      const nameDiv = document.createElement("div");
      nameDiv.className = "heading-style-h6";
      nameDiv.textContent = member[COMMITTEE_API_FIELDS_MAP.name];

      // 创建职位 <div class="text-m-zh-center">
      const positionDiv = document.createElement("div");
      positionDiv.className = positionTextClass;
      positionDiv.textContent = member[COMMITTEE_API_FIELDS_MAP.position];

      // 组装标题包装器
      titleWrapper.appendChild(nameDiv);
      titleWrapper.appendChild(positionDiv);

      // 组装最终的投资委员会成员项
      committeeItem.appendChild(titleWrapper);

      // 将投资委员会成员项添加到虚拟容器中
      fragment.appendChild(committeeItem);
    });

    // 清空容器 (移除 "加载中..." 的提示)
    committeeContainer.innerHTML = "";
    // 将虚拟容器添加到真实容器中
    committeeContainer.appendChild(fragment);
    if (DEBUG_MODE) console.log("✅ 投资委员会渲染完成");
  }

  // 从后端获取投资委员会数据
  if (DEBUG_MODE) console.log("🚀 开始请求投资委员会API数据...");
  fetch(committeeApiUrl)
    .then((response) => {
      if (DEBUG_MODE) {
        console.log("📡 收到投资委员会API响应:");
        console.log("   - 状态码:", response.status);
        console.log("   - 状态文本:", response.statusText);
        console.log("   - Content-Type:", response.headers.get("content-type"));
        console.log("   - 响应URL:", response.url);
      }

      // 检查服务器响应是否成功 (HTTP状态码 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 将响应体解析为JSON
      return response.json();
    })
    .then((data) => {
      if (DEBUG_MODE) {
        console.log("📊 投资委员会API返回数据:");
        console.log("   - 数据类型:", typeof data);
        console.log("   - 是否为数组:", Array.isArray(data));
        console.log("   - 数据长度:", data?.length);
        console.log("   - 完整数据:", data);
      }

      // 处理API返回的标准格式 {code: 0, message: '请求成功', data: [...]}
      let committeeData = data;

      // 如果返回的是包含data字段的对象，提取data字段
      if (data && typeof data === "object" && data.hasOwnProperty("data")) {
        if (DEBUG_MODE) console.log("🔄 检测到标准API格式，提取data字段");
        committeeData = data.data;
        if (DEBUG_MODE) {
          console.log("   - 提取的投资委员会数据:", committeeData);
          console.log("   - 投资委员会成员数量:", committeeData?.length);
        }
      }

      // 成功获取并解析数据后，调用渲染函数
      if (
        committeeData &&
        Array.isArray(committeeData) &&
        committeeData.length > 0
      ) {
        if (DEBUG_MODE) console.log("✅ 开始渲染投资委员会数据");
        renderCommitteeMembers(committeeData);
      } else {
        if (DEBUG_MODE) console.log("⚠️ 没有找到有效的投资委员会数据");
        // API返回了空数组或无效数据
        committeeContainer.innerHTML = `<p style="text-align: center">${uiTexts.committeeNoData}</p>`;
      }
    })
    .catch((error) => {
      // 捕获网络请求过程中的任何错误
      if (DEBUG_MODE) {
        console.error("❌ 获取投资委员会数据失败:");
        console.error("   - 错误类型:", error.name);
        console.error("   - 错误信息:", error.message);
        console.error("   - 完整错误:", error);
      }

      // 在页面上向用户显示错误信息
      committeeContainer.innerHTML = `<p style="text-align: center; color: red;">${uiTexts.committeeError}</p>`;
    });
});

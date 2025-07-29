//language switcher logic

(function () {
  var langSelected = sessionStorage.getItem("langSelected");
  if (!langSelected) {
    var userLang = navigator.language || navigator.userLanguage;
    var lang = userLang.substr(0, 2).toLowerCase();
    if (lang === "zh") {
      // 只有当当前页面不是中文页面时才跳转
      if (window.location.pathname.indexOf("/zh/") === -1) {
        window.location.replace("/zh/");
      }
    }
  }
})();

// 脚本第二部分：供按钮调用的手动设置函数
function setLangPreference(lang) {
  sessionStorage.setItem("langSelected", "true");
  if (lang === "zh") {
    window.location.href = "/zh/";
  } else {
    window.location.href = "/"; // 跳转到英文主页 (根目录)
  }
}

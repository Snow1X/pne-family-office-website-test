document.addEventListener("DOMContentLoaded", function () {
  // 1. 获取DOM元素
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return; // 如果页面上没有表单，则直接退出

  const formMessage = document.getElementById("form-message");
  const submitButton = contactForm.querySelector(".submit-button");

  //反馈消息处理
  let messageTimer; // 在外部定义一个变量来持有定时器
  function showAndHideMessage(text, type, duration) {
    // 如果有上一条消息的定时器还在，先清除它
    clearTimeout(messageTimer);

    // 1. 设置内容和样式，并立即显示
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`; // e.g., 'form-message success'
    formMessage.style.display = "block";

    // 2. 设置一个定时器，在 duration 毫秒后执行隐藏操作
    messageTimer = setTimeout(() => {
      formMessage.classList.add("hidden");
      setTimeout(() => {
        formMessage.style.display = "none";
        formMessage.classList.remove("hidden"); // 清理class
      }, 300);
    }, duration);
  }

  // 2. 定义前端使用的消息（主要是验证错误和按钮文本）
  const uiText = {
    en: {
      // invalid_form: "Please fill out all fields correctly before submitting.",
      submit_button_default: "Book a Private Appointment",
      submit_button_sending: "Sending...",
    },
    "zh-CN": {
      // invalid_form: "提交前，请正确填写所有必填项。",
      submit_button_default: "预约私人咨询",
      submit_button_sending: "发送中...",
    },
  };

  // 获取当前语言和对应的文本
  const lang = document.documentElement.lang || "en";
  const currentText = uiText[lang];

  // 3. 监听表单提交事件
  contactForm.addEventListener("submit", async function (event) {
    // a. 阻止表单默认提交
    event.preventDefault();

    // // b. 【新增】前端格式验证
    // if (!contactForm.checkValidity()) {
    //   formMessage.textContent = currentText.invalid_form;
    //   formMessage.className = "form-message error";
    //   return; // 验证失败，停止执行
    // }

    // c. 禁用按钮，进入发送中状态
    submitButton.disabled = true;
    submitButton.textContent = currentText.submit_button_sending;
    formMessage.style.display = "none";

    // d. 构造表单数据
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      lang: lang,
    };

    try {
      // e. 调用API（将来替换这里）
      const response = await mockApiCallWithMessages(formData);

      // f. 用后端返回的成功消息
      showAndHideMessage(response.message, "success", 3000);
      contactForm.reset();
    } catch (error) {
      // g. 使用后端返回的错误消息
      showAndHideMessage(
        error.message || "An unexpected error occurred.",
        "error",
        3000
      );
      console.error("API Error:", error);
    } finally {
      // h. 恢复按钮状态
      submitButton.disabled = false;
      submitButton.textContent = currentText.submit_button_default;
    }
  });

  /**
   * 【模拟后端API】
   */
  function mockApiCallWithMessages(data) {
    console.log("Sending data to mock API:", data);

    // 模拟的后端多语言消息
    const backendMessages = {
      en: {
        success: "Thank you for your submission! We will be in touch shortly.",
        failure:
          "Our apologies, but the server is currently busy. Please try again later.",
      },
      "zh-CN": {
        success: "感谢您的提交！我们将尽快与您取得联系。",
        failure: "非常抱歉，服务器当前繁忙，请稍后重试。",
      },
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.8) {
          // 成功：返回一个包含 message 的对象
          resolve({
            status: "success",
            message: backendMessages[data.lang].success,
          });
        } else {
          // 失败：reject 一个包含 message 的 Error 对象
          reject(new Error(backendMessages[data.lang].failure));
        }
      }, 1500);
    });
  }
});

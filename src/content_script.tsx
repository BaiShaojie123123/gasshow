//注入页面,在刷新当前页面,或者打开新的tab页面执行
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

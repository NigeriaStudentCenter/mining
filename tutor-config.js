// Public configuration only. Never put an API key, function key, Paystack secret key or other secret here.
window.COURSE_CONFIG = {
 "api": "https://func-mining-course.azurewebsites.net/api",
 "links": {
  "payFull": "",
  "payInstalment": "",
  "enrolForm": ""
 }
};
window.TUTOR_CONFIG = {endpoint: window.COURSE_CONFIG.api ? window.COURSE_CONFIG.api + '/tutor' : '', provider: 'Azure', timeoutMs: 45000};

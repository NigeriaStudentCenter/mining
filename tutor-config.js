// Public configuration only. Never put an API key, function key, Paystack secret key or other secret here.
window.COURSE_CONFIG = {
 "api": "https://func-mining-course.azurewebsites.net/api",
 "links": {
  "payFull": "",
  "payInstalment": "",
  "enrolForm": "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=iBFpdp2b7ke7Wir-xS9NXguXesy5xKlEksmVVecOy5ZURDQ4WEtDUTBNSVpXTUdSS09SSzQxWjg3Qy4u"
 }
};
window.TUTOR_CONFIG = {endpoint: window.COURSE_CONFIG.api ? window.COURSE_CONFIG.api + '/tutor' : '', provider: 'Azure', timeoutMs: 45000};

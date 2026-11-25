chrome.runtime.onMessage.addListener(function(m){
  if(m&&m.t==='alert'){
    chrome.notifications.create({type:'basic',iconUrl:'icon-128.png',title:'🚨 Cảnh báo lừa đảo',message:'Đã chặn link có điểm rủi ro '+m.s+'/100'});
  }
});

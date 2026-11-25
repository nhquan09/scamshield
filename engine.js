
var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')};
var esc=function(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var TEXT=[
[/\b(otp|ma xac thuc|mat khau|cvv|so the|ma pin)\b/,30,'Yêu cầu cung cấp OTP, mật khẩu hoặc thông tin thẻ. Ngân hàng thật không bao giờ hỏi qua tin nhắn.'],
[/(khoa tai khoan|tam khoa|dong bang|bi khoa|huy tai khoan|truy to|lenh bat|bat giu)/,22,'Đe dọa khóa tài khoản hoặc truy cứu để tạo hoảng sợ.'],
[/(khan cap|ngay lap tuc|trong vong \d+ ?(gio|phut)|het han|con \d+ ?(gio|phut)|nhanh tay)/,14,'Tạo áp lực thời gian để nạn nhân không kịp suy nghĩ.'],
[/(trung thuong|qua tang|nhan thuong|mien phi|voucher|hoan tien|duoc chon|chuc mung)/,20,'Hứa trúng thưởng, quà tặng hoặc hoàn tiền bất ngờ.'],
[/(kiem tien|lai suat cao|dau tu|viec nhe luong cao|cong tac vien|nhiem vu|chot don|hoa hong)/,20,'Mời làm việc nhẹ lương cao hoặc đầu tư lãi lớn, thủ đoạn phổ biến.'],
[/(chuyen khoan|so tai khoan|dat coc|nop phi|phi van chuyen|phi xu ly)/,22,'Yêu cầu chuyển tiền hoặc nộp phí trước.'],
[/(cong an|vien kiem sat|toa an|buu dien|dien luc|ngan hang|vietcombank|vcb|techcombank|mb ?bank|bidv|vietinbank|agribank|momo|zalopay|shopee|tiktok|viettel|vnpt|bhxh)/,10,'Nhắc đến cơ quan, ngân hàng hoặc nền tảng uy tín. Kẻ lừa đảo thường mạo danh.'],
[/(zalo|telegram|lien he|goi ngay|hotline)/,10,'Dẫn dụ sang kênh Zalo, Telegram hoặc gọi điện để tránh bị kiểm soát.'],
[/(chia se ngay|share ngay|truoc khi bi xoa|bi giau|khong muon ban biet|giat gan|tin nong|nghe noi|cuc ky nguy hiem|lan truyen)/,18,'Ngôn ngữ giật gân, kêu gọi chia sẻ gấp. Đặc trưng của tin giả.'],
[/(chua khoi moi benh|thuoc tien|bao dam 100|chac chan 100%)/,16,'Khẳng định tuyệt đối, thiếu căn cứ khoa học.']
];
var SHORT=['bit.ly','tinyurl.com','t.ly','cutt.ly','rebrand.ly','is.gd','s.id','shorturl.at','ow.ly'];
var TLD=/\.(xyz|top|click|icu|vip|cc|tk|ml|ga|cf|shop|live|site|online|buzz)$/;
var BRANDS=['vietcombank','techcombank','mbbank','bidv','vietinbank','agribank','momo','zalopay','shopee','tiktok','facebook','google','zalo','paypal','apple'];
function urls(t){var m=t.match(/(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|vn|net|org|xyz|top|click|icu|vip|cc|tk|ml|ga|cf|shop|live|site|online|buzz|info|me|ly|io)(\/[^\s]*)?)/gi)||[];return m.map(function(u){return u.replace(/[.,;:!?)]+$/,'')})}
function checkUrl(u,out){
var h;try{h=new URL(/^https?:\/\//i.test(u)?u:'https://'+u).hostname.toLowerCase()}catch(e){return}
var p=h.split('.'),n=p.length,reg=(n>=3&&/^(com|net|org|gov|edu)$/.test(p[n-2])&&p[n-1].length==2)?p.slice(-3):p.slice(-2),lab=reg[0],tag=' ('+h+')';
if(SHORT.indexOf(h)>-1)out.push([20,'Link rút gọn che giấu địa chỉ thật'+tag+'.']);
if(/^\d{1,3}(\.\d{1,3}){3}$/.test(h))out.push([30,'Link dùng địa chỉ IP thay vì tên miền'+tag+'.']);
if(TLD.test(h))out.push([18,'Đuôi tên miền hay bị lạm dụng cho trang lừa đảo'+tag+'.']);
if(/^http:\/\//i.test(u))out.push([10,'Trang không dùng HTTPS (không mã hóa).']);
if(u.indexOf('@')>-1)out.push([25,'Link chứa ký tự @ để đánh lừa địa chỉ thật.']);
if(h.indexOf('xn--')>-1)out.push([25,'Tên miền dùng ký tự giả (punycode)'+tag+'.']);
if((h.match(/-/g)||[]).length>=2||n>=5)out.push([12,'Tên miền có quá nhiều dấu gạch hoặc tầng phụ'+tag+'.']);
var h2=h.replace(/0/g,'o').replace(/1/g,'l').replace(/rn/g,'m'),done=false;
BRANDS.forEach(function(b){if(done)return;
if(h.indexOf(b)>-1&&lab!==b){out.push([35,'Tên miền chứa thương hiệu “'+b+'” nhưng không phải trang chính thức'+tag+'.']);done=true}
else if(h.indexOf(b)<0&&h2.indexOf(b)>-1){out.push([30,'Tên miền viết nhái thương hiệu “'+b+'”'+tag+'.']);done=true}})}
function analyze(t){
var r=[],n=norm(t),us=urls(t);
TEXT.forEach(function(x){if(x[0].test(n))r.push([x[1],x[2]])});
if(us.length){r.push([8,'Có chứa '+us.length+' đường link. Không bấm link từ nguồn lạ.']);us.forEach(function(u){checkUrl(u,r)})}
var L=t.replace(/[^A-Za-zÀ-ỹ]/g,'');
if(L.length>20&&(L.replace(/[^A-ZÀ-Ỹ]/g,'').length/L.length)>0.3)r.push([8,'Viết hoa quá nhiều để gây chú ý.']);
if((t.match(/!/g)||[]).length>=3)r.push([6,'Dùng nhiều dấu chấm than.']);
var s=Math.min(100,r.reduce(function(a,x){return a+x[0]},0));
r.sort(function(a,b){return b[0]-a[0]});return{s:s,r:r}}

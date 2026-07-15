// Goy OSINT — كتالوج الأدوات
// كل أداة: { name, desc, url(q) => string, categories: [...] }
// النوع (type) يُستخدم لتصفية الأدوات المناسبة تلقائياً.
window.GOY_CATEGORIES = {
  search:    { title: "محركات البحث",       icon: "🔎" },
  username:  { title: "أسماء المستخدمين",   icon: "👤" },
  email:     { title: "البريد الإلكتروني",  icon: "✉️" },
  phone:     { title: "أرقام الهواتف",      icon: "📞" },
  domain:    { title: "النطاقات والمواقع",  icon: "🌐" },
  ip:        { title: "عناوين IP والشبكات", icon: "🛰️" },
  person:    { title: "الأشخاص",            icon: "🧑" },
  social:    { title: "الشبكات الاجتماعية", icon: "💬" },
  image:     { title: "الصور والبحث العكسي", icon: "🖼️" },
  document:  { title: "الوثائق والملفات",   icon: "📄" },
  archive:   { title: "الأرشيف التاريخي",   icon: "🏛️" },
  maps:      { title: "الخرائط والمواقع",   icon: "🗺️" },
  hash:      { title: "Hashes & Malware",   icon: "🧬" },
  crypto:    { title: "العملات الرقمية",    icon: "₿" },
  breach:    { title: "تسريبات البيانات",   icon: "🚨" },
  code:      { title: "الكود والمستودعات",  icon: "💻" },
};

const enc = encodeURIComponent;

window.GOY_TOOLS = [
  // ── محركات البحث العامة ─────────────────────────────
  { name: "Google",         desc: "بحث ويب رئيسي",         url: q => `https://www.google.com/search?q=${enc(q)}`,               types: ["general","person","username","email","phone","domain","document"], cat: "search" },
  { name: "Google Dorks",   desc: "بحث متقدم بلغة الدوركس", url: q => `https://www.google.com/search?q=${enc(`intext:"${q}"`)}`, types: ["general","email","phone","username"], cat: "search" },
  { name: "Bing",           desc: "محرك بحث مايكروسوفت",    url: q => `https://www.bing.com/search?q=${enc(q)}`,                types: ["general","person","domain"], cat: "search" },
  { name: "DuckDuckGo",     desc: "بحث مع خصوصية",          url: q => `https://duckduckgo.com/?q=${enc(q)}`,                    types: ["general","person","domain"], cat: "search" },
  { name: "Yandex",         desc: "بحث روسي قوي بالصور",    url: q => `https://yandex.com/search/?text=${enc(q)}`,              types: ["general","person","image"], cat: "search" },
  { name: "Baidu",          desc: "محرك بحث صيني",          url: q => `https://www.baidu.com/s?wd=${enc(q)}`,                   types: ["general","person"], cat: "search" },
  { name: "Startpage",      desc: "نتائج Google بلا تتبع",  url: q => `https://www.startpage.com/do/search?q=${enc(q)}`,        types: ["general"], cat: "search" },
  { name: "Brave Search",   desc: "بحث مستقل",              url: q => `https://search.brave.com/search?q=${enc(q)}`,            types: ["general","domain"], cat: "search" },

  // ── أسماء المستخدمين ────────────────────────────────
  { name: "WhatsMyName",    desc: "فحص اسم مستخدم عبر 600+ موقع", url: q => `https://whatsmyname.app/?q=${enc(q)}`,             types: ["username"], cat: "username" },
  { name: "Namechk",        desc: "توفر اسم المستخدم عبر المنصات", url: q => `https://namechk.com/namechk/username/${enc(q)}`,   types: ["username"], cat: "username" },
  { name: "Instant Username", desc: "بحث متزامن للاسم",     url: q => `https://instantusername.com/#/${enc(q)}`,                types: ["username"], cat: "username" },
  { name: "Sherlock (Web)", desc: "أشهر أداة أسماء مستخدمين", url: q => `https://github.com/sherlock-project/sherlock#usage`,   types: ["username"], cat: "username" },
  { name: "Check Usernames", desc: "فحص عبر 160 منصة",       url: q => `https://checkusernames.com/index.php?username=${enc(q)}`, types: ["username"], cat: "username" },

  // ── البريد الإلكتروني ───────────────────────────────
  { name: "Have I Been Pwned", desc: "هل ظهر بريدك في تسريب؟", url: q => `https://haveibeenpwned.com/account/${enc(q)}`,       types: ["email"], cat: "breach" },
  { name: "Hunter.io",      desc: "بحث بريد الشركات",       url: q => `https://hunter.io/email-verifier/${enc(q)}`,             types: ["email"], cat: "email" },
  { name: "EmailRep",       desc: "سمعة البريد ومصادره",    url: q => `https://emailrep.io/${enc(q)}`,                          types: ["email"], cat: "email" },
  { name: "Epieos",         desc: "استخراج بيانات Google من البريد", url: q => `https://epieos.com/?q=${enc(q)}`,             types: ["email","phone"], cat: "email" },
  { name: "IntelX",         desc: "بحث في التسريبات والوثائق", url: q => `https://intelx.io/?s=${enc(q)}`,                     types: ["email","domain","phone","hash"], cat: "breach" },
  { name: "Dehashed",       desc: "قاعدة تسريبات ضخمة",     url: q => `https://dehashed.com/search?query=${enc(q)}`,            types: ["email","username","domain","phone"], cat: "breach" },
  { name: "LeakCheck",      desc: "بحث في التسريبات",       url: q => `https://leakcheck.io/`,                                  types: ["email","username"], cat: "breach" },

  // ── أرقام الهواتف ───────────────────────────────────
  { name: "Truecaller",     desc: "معرّف المتصلين",         url: q => `https://www.truecaller.com/search/global/${enc(q)}`,     types: ["phone"], cat: "phone" },
  { name: "NumLookup",      desc: "بحث عكسي للأرقام",       url: q => `https://www.numlookup.com/${enc(q)}`,                    types: ["phone"], cat: "phone" },
  { name: "Sync.me",        desc: "معلومات المتصل",         url: q => `https://sync.me/search/?number=${enc(q)}`,               types: ["phone"], cat: "phone" },
  { name: "PhoneInfoga",    desc: "أداة CLI للـ OSINT للهاتف", url: q => `https://github.com/sundowndev/phoneinfoga`,            types: ["phone"], cat: "phone" },
  { name: "WhatsApp Check", desc: "افتح محادثة (يتحقق من التسجيل)", url: q => `https://wa.me/${enc(String(q).replace(/[^0-9]/g,""))}`, types: ["phone"], cat: "phone" },

  // ── النطاقات والمواقع ───────────────────────────────
  { name: "WHOIS (ICANN)",  desc: "بيانات ملكية النطاق",    url: q => `https://lookup.icann.org/en/lookup?q=${enc(q)}`,         types: ["domain"], cat: "domain" },
  { name: "Whoxy",          desc: "WHOIS تاريخي",           url: q => `https://www.whoxy.com/${enc(q)}`,                        types: ["domain"], cat: "domain" },
  { name: "crt.sh",         desc: "شهادات SSL/TLS للنطاق", url: q => `https://crt.sh/?q=${enc(q)}`,                             types: ["domain"], cat: "domain" },
  { name: "SecurityTrails", desc: "تاريخ DNS والنطاقات",    url: q => `https://securitytrails.com/domain/${enc(q)}/dns`,        types: ["domain"], cat: "domain" },
  { name: "BuiltWith",      desc: "التقنيات المستخدمة",     url: q => `https://builtwith.com/${enc(q)}`,                        types: ["domain"], cat: "domain" },
  { name: "Wappalyzer",     desc: "كشف التقنيات",           url: q => `https://www.wappalyzer.com/lookup/${enc(q)}/`,           types: ["domain"], cat: "domain" },
  { name: "urlscan.io",     desc: "تحليل روابط ونطاقات",    url: q => `https://urlscan.io/search/#${enc(q)}`,                   types: ["domain","ip"], cat: "domain" },
  { name: "VirusTotal",     desc: "فحص أمني شامل",          url: q => `https://www.virustotal.com/gui/search/${enc(q)}`,        types: ["domain","ip","hash"], cat: "domain" },
  { name: "DNSDumpster",    desc: "خرائط DNS",              url: q => `https://dnsdumpster.com/`,                               types: ["domain"], cat: "domain" },
  { name: "Sitedossier",    desc: "ملف النطاق",             url: q => `http://www.sitedossier.com/site/${enc(q)}`,              types: ["domain"], cat: "domain" },

  // ── عناوين IP والشبكات ──────────────────────────────
  { name: "Shodan",         desc: "محرك بحث الأجهزة المتصلة", url: q => `https://www.shodan.io/search?query=${enc(q)}`,          types: ["ip","domain"], cat: "ip" },
  { name: "Censys",         desc: "فحص الشبكات والشهادات",  url: q => `https://search.censys.io/search?q=${enc(q)}&resource=hosts`, types: ["ip","domain"], cat: "ip" },
  { name: "ZoomEye",        desc: "بحث أصول الإنترنت",      url: q => `https://www.zoomeye.hk/searchResult?q=${enc(q)}`,         types: ["ip","domain"], cat: "ip" },
  { name: "IPinfo",         desc: "جغرافية وموفر الـ IP",   url: q => `https://ipinfo.io/${enc(q)}`,                            types: ["ip"], cat: "ip" },
  { name: "IPLocation",     desc: "تحديد الموقع الجغرافي",  url: q => `https://www.iplocation.net/ip-lookup?query=${enc(q)}`,   types: ["ip"], cat: "ip" },
  { name: "AbuseIPDB",      desc: "بلاغات إساءة الـ IP",    url: q => `https://www.abuseipdb.com/check/${enc(q)}`,              types: ["ip"], cat: "ip" },
  { name: "GreyNoise",      desc: "ضجيج الإنترنت الخبيث",   url: q => `https://viz.greynoise.io/ip/${enc(q)}`,                  types: ["ip"], cat: "ip" },

  // ── الأشخاص ─────────────────────────────────────────
  { name: "PimEyes",        desc: "بحث عكسي بالوجه",        url: q => `https://pimeyes.com/en`,                                 types: ["image","person"], cat: "person" },
  { name: "That'sThem",     desc: "معلومات أشخاص أمريكيين", url: q => `https://thatsthem.com/name/${enc(q)}`,                   types: ["person","phone","email"], cat: "person" },
  { name: "TruePeopleSearch", desc: "بحث عن أشخاص",         url: q => `https://www.truepeoplesearch.com/results?name=${enc(q)}`, types: ["person","phone"], cat: "person" },
  { name: "Spokeo",         desc: "قاعدة بيانات أشخاص",     url: q => `https://www.spokeo.com/${enc(String(q).replace(/\s+/g,"-"))}`, types: ["person","phone","email"], cat: "person" },
  { name: "Pipl (تجاري)",   desc: "محرك بحث أشخاص شامل",    url: q => `https://pipl.com/`,                                      types: ["person"], cat: "person" },

  // ── الشبكات الاجتماعية ─────────────────────────────
  { name: "X / Twitter",    desc: "بحث في التغريدات",       url: q => `https://twitter.com/search?q=${enc(q)}&f=live`,           types: ["username","general","phone","email"], cat: "social" },
  { name: "Facebook",       desc: "بحث فيسبوك",             url: q => `https://www.facebook.com/search/top?q=${enc(q)}`,        types: ["username","person"], cat: "social" },
  { name: "Instagram",      desc: "بروفايل انستقرام",       url: q => `https://www.instagram.com/${enc(String(q).replace(/^@/,""))}/`, types: ["username"], cat: "social" },
  { name: "TikTok",         desc: "بروفايل تيك توك",        url: q => `https://www.tiktok.com/@${enc(String(q).replace(/^@/,""))}`, types: ["username"], cat: "social" },
  { name: "LinkedIn",       desc: "بحث مهني",               url: q => `https://www.linkedin.com/search/results/all/?keywords=${enc(q)}`, types: ["person","username"], cat: "social" },
  { name: "Reddit",         desc: "بحث في Reddit",          url: q => `https://www.reddit.com/search/?q=${enc(q)}`,             types: ["username","general"], cat: "social" },
  { name: "Telegram (LyzemAI)", desc: "بحث في قنوات تلغرام", url: q => `https://lyzem.com/search?q=${enc(q)}`,                  types: ["username","general"], cat: "social" },
  { name: "YouTube",        desc: "بحث فيديو وقنوات",       url: q => `https://www.youtube.com/results?search_query=${enc(q)}`, types: ["username","general","person"], cat: "social" },

  // ── الصور والبحث العكسي ────────────────────────────
  { name: "Google Images",  desc: "بحث عكسي بالصورة (URL)", url: q => `https://www.google.com/searchbyimage?image_url=${enc(q)}`, types: ["image"], cat: "image" },
  { name: "Google Lens",    desc: "تحليل بصري متقدم",       url: q => `https://lens.google.com/uploadbyurl?url=${enc(q)}`,      types: ["image"], cat: "image" },
  { name: "Yandex Images",  desc: "الأفضل للبحث بالوجه",    url: q => `https://yandex.com/images/search?rpt=imageview&url=${enc(q)}`, types: ["image"], cat: "image" },
  { name: "TinEye",         desc: "بحث عكسي كلاسيكي",       url: q => `https://tineye.com/search?url=${enc(q)}`,                types: ["image"], cat: "image" },
  { name: "Bing Visual",    desc: "بحث بصري",               url: q => `https://www.bing.com/images/search?q=imgurl:${enc(q)}&view=detailv2&iss=sbi`, types: ["image"], cat: "image" },

  // ── الوثائق والملفات ───────────────────────────────
  { name: "Google — PDF",    desc: "بحث ملفات PDF",         url: q => `https://www.google.com/search?q=${enc(`${q} filetype:pdf`)}`, types: ["document","general"], cat: "document" },
  { name: "Google — DOC",    desc: "بحث ملفات Word",        url: q => `https://www.google.com/search?q=${enc(`${q} filetype:doc OR filetype:docx`)}`, types: ["document"], cat: "document" },
  { name: "Google — XLS",    desc: "بحث جداول Excel",       url: q => `https://www.google.com/search?q=${enc(`${q} filetype:xls OR filetype:xlsx`)}`, types: ["document"], cat: "document" },
  { name: "Scribd",          desc: "أرشيف وثائق منشورة",    url: q => `https://www.scribd.com/search?query=${enc(q)}`,          types: ["document"], cat: "document" },
  { name: "DocumentCloud",   desc: "وثائق صحفية موثّقة",    url: q => `https://www.documentcloud.org/search/?q=${enc(q)}`,      types: ["document"], cat: "document" },
  { name: "Internet Archive Scholar", desc: "أوراق أكاديمية", url: q => `https://scholar.archive.org/search?q=${enc(q)}`,       types: ["document"], cat: "document" },

  // ── الأرشيف التاريخي ───────────────────────────────
  { name: "Wayback Machine", desc: "أرشيف صفحات الويب",     url: q => `https://web.archive.org/web/*/${enc(q)}`,                types: ["domain","general"], cat: "archive" },
  { name: "Archive.today",   desc: "أرشيف اللحظة",          url: q => `https://archive.ph/${enc(q)}`,                           types: ["domain","general"], cat: "archive" },
  { name: "Google Cache",    desc: "نسخة Google المخبأة",   url: q => `https://webcache.googleusercontent.com/search?q=cache:${enc(q)}`, types: ["domain","general"], cat: "archive" },
  { name: "CachedView",      desc: "بحث في كل الكاشات",     url: q => `https://cachedview.com/`,                                types: ["domain","general"], cat: "archive" },

  // ── الخرائط والمواقع ───────────────────────────────
  { name: "Google Maps",     desc: "بحث موقع أو إحداثيات",  url: q => `https://www.google.com/maps/search/${enc(q)}`,           types: ["general","person","domain"], cat: "maps" },
  { name: "OpenStreetMap",   desc: "خرائط مفتوحة",          url: q => `https://www.openstreetmap.org/search?query=${enc(q)}`,   types: ["general"], cat: "maps" },
  { name: "Bing Maps",       desc: "صور جوية بديلة",        url: q => `https://www.bing.com/maps?q=${enc(q)}`,                  types: ["general"], cat: "maps" },
  { name: "Wikimapia",       desc: "خرائط تعاونية",         url: q => `https://wikimapia.org/#lang=ar&search=${enc(q)}`,        types: ["general"], cat: "maps" },
  { name: "GeoHints",        desc: "أدلة GeoGuessing",      url: q => `https://geohints.com/`,                                  types: ["image"], cat: "maps" },

  // ── Hashes & Malware ───────────────────────────────
  { name: "VirusTotal Hash", desc: "فحص Hash",              url: q => `https://www.virustotal.com/gui/search/${enc(q)}`,        types: ["hash"], cat: "hash" },
  { name: "MalwareBazaar",   desc: "قاعدة عيّنات",           url: q => `https://bazaar.abuse.ch/browse.php?search=${enc(q)}`,   types: ["hash"], cat: "hash" },
  { name: "Hybrid Analysis", desc: "تحليل ديناميكي",         url: q => `https://www.hybrid-analysis.com/search?query=${enc(q)}`, types: ["hash","domain","ip"], cat: "hash" },
  { name: "ANY.RUN",         desc: "Sandbox تفاعلي",         url: q => `https://any.run/submissions/?query=${enc(q)}`,          types: ["hash","domain"], cat: "hash" },

  // ── العملات الرقمية ────────────────────────────────
  { name: "Blockchain.com",  desc: "متصفح Bitcoin",         url: q => `https://www.blockchain.com/explorer/search?search=${enc(q)}`, types: ["bitcoin","hash"], cat: "crypto" },
  { name: "BlockChair",      desc: "متعدد العملات",         url: q => `https://blockchair.com/search?q=${enc(q)}`,              types: ["bitcoin","hash"], cat: "crypto" },
  { name: "Etherscan",       desc: "متصفح Ethereum",        url: q => `https://etherscan.io/search?q=${enc(q)}`,                types: ["bitcoin","hash"], cat: "crypto" },
  { name: "Bitcoin Abuse",   desc: "بلاغات محافظ خبيثة",     url: q => `https://www.bitcoinabuse.com/reports/${enc(q)}`,        types: ["bitcoin"], cat: "crypto" },

  // ── الكود والمستودعات ─────────────────────────────
  { name: "GitHub",          desc: "بحث في الكود العام",     url: q => `https://github.com/search?q=${enc(q)}&type=code`,       types: ["general","username","email","domain"], cat: "code" },
  { name: "GitHub Users",    desc: "بحث عن مستخدمي GitHub",  url: q => `https://github.com/search?q=${enc(q)}&type=users`,      types: ["username","email","person"], cat: "code" },
  { name: "GitLab",          desc: "بحث في GitLab",          url: q => `https://gitlab.com/search?search=${enc(q)}`,            types: ["general","username"], cat: "code" },
  { name: "Sourcegraph",     desc: "بحث كود عبر مستودعات",   url: q => `https://sourcegraph.com/search?q=${enc(q)}`,            types: ["general"], cat: "code" },
  { name: "grep.app",        desc: "grep عبر GitHub",        url: q => `https://grep.app/search?q=${enc(q)}`,                   types: ["general","email","domain"], cat: "code" },
];

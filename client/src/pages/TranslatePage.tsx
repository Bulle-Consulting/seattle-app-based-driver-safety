import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Globe, Phone } from "lucide-react";

const LANGUAGES = [
  {
    name: "Somali",
    native: "Soomaali",
    message: "Xuquuqdaada shaqaale ahaan oo ku salaysan app-ka waxaa ilaaliya sharciga Seattle. La xiriir OLS si aad u hesho caawimaad.",
    flag: "🇸🇴",
  },
  {
    name: "Amharic",
    native: "አማርኛ",
    message: "በመተግበሪያ ላይ የተመሠረተ ሠራተኛ መብቶችዎ በሲያትል ሕግ የተጠበቁ ናቸው። ለእርዳታ OLS ያግኙ።",
    flag: "🇪🇹",
  },
  {
    name: "Tigrinya",
    native: "ትግርኛ",
    message: "ከም ኣፕ-መሰረት ዝኾነ ሰራሕተኛ መሰላትኩም ብሕጊ ስያትል ዝተሓለወ እዩ። ንሓገዝ OLS ተወከሱ።",
    flag: "🇪🇷",
  },
  {
    name: "Oromiffa",
    native: "Afaan Oromoo",
    message: "Mirgi hojjetaa app irratti hundaa'e keessan seeraa Seattle tiin eegama. Gargaarsa argachuuf OLS quunnamaa.",
    flag: "🇪🇹",
  },
  {
    name: "Chinese (Simplified)",
    native: "中文",
    message: "您作为网约工的权利受西雅图法律保护。请联系OLS获取帮助。",
    flag: "🇨🇳",
  },
  {
    name: "Farsi",
    native: "فارسی",
    message: "حقوق شما به عنوان کارگر مبتنی بر اپلیکیشن توسط قانون سیاتل محافظت می‌شود. برای کمک با OLS تماس بگیرید.",
    flag: "🇮🇷",
    rtl: true,
  },
  {
    name: "Tagalog",
    native: "Tagalog",
    message: "Ang iyong mga karapatan bilang app-based na manggagawa ay protektado ng batas ng Seattle. Makipag-ugnayan sa OLS para sa tulong.",
    flag: "🇵🇭",
  },
  {
    name: "Spanish",
    native: "Español",
    message: "Sus derechos como trabajador basado en aplicaciones están protegidos por la ley de Seattle. Comuníquese con OLS para obtener ayuda.",
    flag: "🇲🇽",
  },
  {
    name: "Pashto",
    native: "پښتو",
    message: "ستاسو حقوق د اپلیکیشن پراساس کارګر په توګه د سیاتل د قانون لخوا خوندي دي. د مرستې لپاره له OLS سره اړیکه ونیسئ.",
    flag: "🇦🇫",
    rtl: true,
  },
  {
    name: "Vietnamese",
    native: "Tiếng Việt",
    message: "Quyền của bạn với tư cách là người lao động dựa trên ứng dụng được pháp luật Seattle bảo vệ. Liên hệ OLS để được trợ giúp.",
    flag: "🇻🇳",
  },
];

export default function TranslatePage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Translate" subtitle="Access information in your language" />
        <main className="flex-1 p-5 space-y-5 overflow-y-auto">

          {/* Intro */}
          <div className="bg-[rgba(13,148,136,0.1)] border border-[#0d9488]/30 rounded-md px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={14} className="text-[#0d9488]" />
              <span className="text-[12px] font-semibold text-[#2dd4bf]">Worker Rights in Your Language</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Seattle's Office of Labor Standards provides information and assistance in multiple languages. Your rights as an app-based worker are the same regardless of the language you speak. Contact OLS at <strong className="text-[#e2e8f0]">206-256-5297</strong> for multilingual support.
            </p>
          </div>

          {/* Language cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {LANGUAGES.map((lang) => (
              <div key={lang.name} className="bg-[#1e293b] border border-[#334155] rounded-md p-4 hover:border-[#475569] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px] leading-none">{lang.flag}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0d9488]">{lang.name}</div>
                    <div className="text-[11px] text-[#94a3b8]">{lang.native}</div>
                  </div>
                </div>

                <div className="h-px bg-[#334155] mb-3" />

                <p
                  className="text-[11px] text-[#94a3b8] leading-relaxed mb-3"
                  dir={lang.rtl ? "rtl" : "ltr"}
                  style={{ fontFamily: lang.rtl ? "'Noto Sans Arabic', 'Segoe UI', sans-serif" : undefined }}
                >
                  {lang.message}
                </p>

                <div className="space-y-1.5">
                  <a
                    href="https://seattle.gov/laborstandards/languages"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-[#0d9488] hover:text-[#2dd4bf] transition-colors"
                  >
                    <Globe size={10} />
                    <span>Visit seattle.gov/laborstandards/languages</span>
                  </a>
                  <a
                    href="tel:206-256-5297"
                    className="flex items-center gap-1.5 text-[10px] text-[#64748b] hover:text-[#94a3b8] transition-colors"
                  >
                    <Phone size={10} />
                    <span>206-256-5297</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer callout */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-md px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-[12px] font-semibold text-[#e2e8f0] mb-1">Need help in another language?</div>
              <p className="text-[11px] text-[#94a3b8]">
                OLS provides interpreter services and translated materials. Languages include: Amharic, Arabic, Chinese, French, Hindi, Japanese, Korean, Oromo, Russian, Somali, Spanish, Tagalog, Tigrigna, Turkish, Ukrainian, Vietnamese, and more.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <a href="tel:206-256-5297" className="flex items-center gap-2 bg-[#0d9488] text-white rounded px-4 py-2 text-[11px] font-medium hover:bg-[#0f766e] transition-colors whitespace-nowrap">
                <Phone size={12} /> Call 206-256-5297
              </a>
              <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] text-[#94a3b8] rounded px-4 py-2 text-[11px] hover:border-[#475569] transition-colors whitespace-nowrap">
                <Globe size={12} /> seattle.gov/laborstandards
              </a>
            </div>
          </div>

          <div className="text-[9px] text-[#64748b] pb-2">
            Translation information provided to support Seattle OLS outreach. Powered by Bulle Cloud · bullecloud.com
          </div>
        </main>
      </div>
    </div>
  );
}

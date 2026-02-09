import { Scale } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-navy-dark text-white/70">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-gold" />
            <span className="font-semibold text-white">AI合同审查助手</span>
          </div>

          <div className="text-sm text-center md:text-right">
            <p>© 2024 AI合同审查助手. 保留所有权利.</p>
            <p className="mt-1">
              本产品仅供参考，不构成法律建议。重要合同请咨询专业律师。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

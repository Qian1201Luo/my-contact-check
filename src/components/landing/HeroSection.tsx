import { Shield, FileCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary via-navy to-navy-dark overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-light rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* 信任标识 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-gold text-sm font-medium tracking-wide">端到端加密 · 数据安全保障</span>
          </div>

          {/* 核心标语 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            上传合同
            <br />
            <span className="text-gold">1分钟</span>获取风险报告
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            AI智能审查 · 精准识别风险条款 · 专业修改建议
          </p>

          {/* 功能按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy-dark font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/auth">预约内测</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
              asChild
            >
              <Link to="/sample-report">查看样例报告</Link>
            </Button>
          </div>

          {/* 特性卡片 */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <FeatureCard
              icon={<FileCheck className="w-8 h-8" />}
              title="智能风险识别"
              description="自动识别合同中的潜在风险条款，按高/中/低分级展示"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="快速审查"
              description="传统人工审查需要数小时，AI审查仅需1分钟"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="专业建议"
              description="每条风险点配有专业修改建议，助您规避法律风险"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-gold/30 transition-colors">
    <div className="text-gold mb-4">{icon}</div>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-white/70 text-sm">{description}</p>
  </div>
);

export default HeroSection;

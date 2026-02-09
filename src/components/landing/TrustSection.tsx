import { Lock, Server, Trash2, Scale } from "lucide-react";

const TrustSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            您的数据安全是我们的首要任务
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            我们深知合同文件的敏感性，采用多重安全措施保护您的数据
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <TrustCard
            icon={<Lock className="w-10 h-10" />}
            title="端到端加密"
            description="所有文件传输和存储均采用AES-256加密"
          />
          <TrustCard
            icon={<Server className="w-10 h-10" />}
            title="私有服务器"
            description="数据存储于符合ISO 27001标准的安全服务器"
          />
          <TrustCard
            icon={<Trash2 className="w-10 h-10" />}
            title="48小时自动删除"
            description="上传文件48小时后自动永久删除，不留痕迹"
          />
          <TrustCard
            icon={<Scale className="w-10 h-10" />}
            title="法律合规"
            description="符合《个人信息保护法》等相关法规要求"
          />
        </div>
      </div>
    </section>
  );
};

const TrustCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="text-center p-6 rounded-xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition-all">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default TrustSection;

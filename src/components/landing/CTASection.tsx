import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // 获取 UTM 参数
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || null;
      const utmMedium = urlParams.get("utm_medium") || null;
      const utmCampaign = urlParams.get("utm_campaign") || null;

      const { error } = await supabase.from("waitlist").insert({
        email,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "您已预约",
            description: "该邮箱已在预约列表中，我们会尽快联系您！",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "预约成功！",
          description: "我们会在内测开放时第一时间通知您",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "预约失败",
        description: "请稍后重试或联系我们",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-navy to-navy-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            抢先体验 AI 合同审查
          </h2>
          <p className="text-white/80 text-lg mb-8">
            留下您的邮箱，我们会在内测开放时第一时间通知您
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="您的邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold hover:bg-gold-dark text-navy-dark font-semibold px-8"
            >
              {loading ? "提交中..." : "预约内测"}
            </Button>
          </form>

          <p className="text-white/50 text-sm mt-4">
            我们尊重您的隐私，绝不会向第三方分享您的信息
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

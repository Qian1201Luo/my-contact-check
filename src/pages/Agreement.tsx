import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Agreement = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    // Check if already signed
    supabase
      .from("profiles")
      .select("agreement_signed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.agreement_signed) navigate("/dashboard");
        setLoading(false);
      });
  }, [user, navigate]);

  const handleSign = async () => {
    if (!user || !agreed) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ agreement_signed: true, agreement_signed_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "签署失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "签署成功", description: "欢迎使用AI合同审查助手！" });
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center gap-2">
          <Scale className="w-5 h-5 text-gold" />
          <span className="font-semibold">AI合同审查助手</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <CardTitle className="text-2xl">数据保密与测试协议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-6 max-h-80 overflow-y-auto text-sm space-y-4">
              <h3 className="font-semibold">一、服务说明</h3>
              <p>本服务为AI合同审查助手的内部测试版本，旨在通过人工智能技术辅助合同风险识别与分析。本服务所提供的分析结果仅供参考，不构成法律意见或法律服务。</p>

              <h3 className="font-semibold">二、数据安全承诺</h3>
              <p>1. 您上传的合同文件将在上传后48小时内自动删除，我们不会长期保留您的文件。</p>
              <p>2. 所有文件传输均采用加密技术保护。</p>
              <p>3. 我们的工作人员将严格遵守保密义务。</p>

              <h3 className="font-semibold">三、用户义务</h3>
              <p>1. 请确保上传的合同已进行必要的脱敏处理（如替换真实姓名、地址等）。</p>
              <p>2. 请勿上传涉及国家秘密、商业核心机密的文件。</p>
              <p>3. 您对上传文件的合法性和脱敏处理承担责任。</p>

              <h3 className="font-semibold">四、免责声明</h3>
              <p>1. 本服务处于测试阶段，分析结果可能存在不准确之处。</p>
              <p>2. 重要决策请务必咨询专业律师。</p>
              <p>3. 本平台不对使用分析结果产生的任何后果承担责任。</p>

              <h3 className="font-semibold">五、反馈与改进</h3>
              <p>作为测试用户，我们诚邀您对分析结果提供反馈，帮助我们改进服务质量。</p>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
              />
              <label htmlFor="agreement" className="text-sm cursor-pointer leading-relaxed">
                我已阅读并同意以上《数据保密与测试协议》，并确认上传的合同文件已进行必要的脱敏处理。
              </label>
            </div>

            <Button onClick={handleSign} className="w-full" disabled={!agreed || submitting}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {submitting ? "签署中..." : "确认签署并继续"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Agreement;

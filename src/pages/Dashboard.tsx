import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Upload, Clock, CheckCircle, Loader2, Scale, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAgreementGuard } from "@/hooks/useAgreementGuard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  file_name: string;
  contract_type: string;
  status: string;
  uploaded_at: string;
  expires_at: string;
}

const Dashboard = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { checking, user } = useAgreementGuard();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!checking && user) fetchContracts();
  }, [checking, user]);

  const fetchContracts = async () => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", user!.id)
      .order("uploaded_at", { ascending: false });
    if (!error && data) setContracts(data);
    setLoading(false);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "已过期";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${mins}分钟`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "processing":
        return <Badge className="bg-amber-500 hover:bg-amber-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />待处理</Badge>;
    }
  };

  const getContractTypeLabel = (type: string) => {
    return type === "nda" ? "保密协议 (NDA)" : "试用协议";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">AI合同审查助手</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">{user?.email}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" />退出
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">我的合同</h1>
            <p className="text-muted-foreground">管理您提交的合同审查请求</p>
          </div>
          <Button asChild>
            <Link to="/upload">
              <Upload className="w-4 h-4 mr-2" />上传合同
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无合同</h3>
              <p className="text-muted-foreground mb-6">上传您的第一份合同以开始AI审查</p>
              <Button asChild>
                <Link to="/upload">
                  <Upload className="w-4 h-4 mr-2" />上传合同
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.file_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{getContractTypeLabel(contract.contract_type)}</span>
                        <span>·</span>
                        <span>上传于 {new Date(contract.uploaded_at).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>剩余 {getTimeRemaining(contract.expires_at)}</span>
                      </div>
                    </div>
                    {getStatusBadge(contract.status)}
                    {contract.status === "completed" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/report/${contract.id}`}>查看报告</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

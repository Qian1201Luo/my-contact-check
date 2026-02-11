import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, FileText, Clock, CheckCircle, Loader2, Users, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminQueue = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    checkRoleAndFetch();
  }, [user]);

  const checkRoleAndFetch = async () => {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
    const role = roles?.find(r => r.role === "admin" || r.role === "operator")?.role;
    if (!role) { navigate("/dashboard"); return; }
    setUserRole(role);

    const { data } = await supabase.from("contracts").select("*").order("uploaded_at", { ascending: false });
    if (data) setContracts(data);
    setLoading(false);
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "completed": return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "processing": return <Badge className="bg-amber-500 text-white"><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />待处理</Badge>;
    }
  };

  const pending = contracts.filter(c => c.status === "pending");
  const processing = contracts.filter(c => c.status === "processing");
  const completed = contracts.filter(c => c.status === "completed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">管理后台</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/admin" className="text-sm hover:opacity-80">队列</Link>
            <Link to="/admin/analytics" className="text-sm hover:opacity-80">数据分析</Link>
            <Button variant="ghost" size="sm" className="text-primary-foreground" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-1" />退出
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">待处理合同队列</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />待处理: {pending.length}</span>
            <span className="flex items-center gap-1"><Loader2 className="w-4 h-4" />处理中: {processing.length}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />已完成: {completed.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">待处理 ({pending.length})</TabsTrigger>
              <TabsTrigger value="processing">处理中 ({processing.length})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({completed.length})</TabsTrigger>
            </TabsList>

            {["pending", "processing", "completed"].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {(tab === "pending" ? pending : tab === "processing" ? processing : completed).map(c => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{c.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.contract_type === "nda" ? "NDA" : "试用协议"} · {new Date(c.uploaded_at).toLocaleString("zh-CN")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusLabel(c.status)}
                        <Button size="sm" asChild>
                          <Link to={`/admin/edit/${c.id}`}>
                            {c.status === "completed" ? "查看报告" : "填写报告"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(tab === "pending" ? pending : tab === "processing" ? processing : completed).length === 0 && (
                  <p className="text-center text-muted-foreground py-12">暂无数据</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AdminQueue;

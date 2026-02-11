import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Users, FileText, Star, MessageSquare, LogOut, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminAnalytics = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalContracts: 0, completedReports: 0, avgSatisfaction: 0 });
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    // Check role
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
    if (!roles?.find(r => r.role === "admin")) { navigate("/dashboard"); return; }

    // Stats
    const [contractsRes, reportsRes, feedbackRes, waitlistRes] = await Promise.all([
      supabase.from("contracts").select("id", { count: "exact", head: true }),
      supabase.from("review_reports").select("id", { count: "exact", head: true }),
      supabase.from("report_feedback").select("*"),
      supabase.from("waitlist").select("id", { count: "exact", head: true }),
    ]);

    const fb = feedbackRes.data || [];
    const avg = fb.length > 0 ? fb.reduce((s, f) => s + f.satisfaction_rating, 0) / fb.length : 0;

    setStats({
      totalUsers: 0, // profiles count would need admin policy
      totalContracts: contractsRes.count || 0,
      completedReports: reportsRes.count || 0,
      avgSatisfaction: Math.round(avg * 10) / 10,
    });
    setFeedbacks(fb);
    setWaitlistCount(waitlistRes.count || 0);
    setLoading(false);
  };

  const exportFeedback = () => {
    const csv = [
      ["满意度", "效率评分", "付费意愿", "评论", "可访谈", "时间"].join(","),
      ...feedbacks.map(f => [
        f.satisfaction_rating, f.efficiency_rating || "", f.willingness_to_pay || "",
        `"${(f.comments || "").replace(/"/g, '""')}"`, f.interview_available ? "是" : "否",
        new Date(f.created_at).toLocaleString("zh-CN"),
      ].join(","))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "feedback_export.csv"; a.click();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
            <Link to="/admin/analytics" className="text-sm hover:opacity-80 font-bold underline">数据分析</Link>
            <Button variant="ghost" size="sm" className="text-primary-foreground" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-1" />退出
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">数据分析面板</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{waitlistCount}</p>
              <p className="text-xs text-muted-foreground">候补注册</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalContracts}</p>
              <p className="text-xs text-muted-foreground">提交合同</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.completedReports}</p>
              <p className="text-xs text-muted-foreground">已完成报告</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 mx-auto text-gold mb-2" />
              <p className="text-2xl font-bold">{stats.avgSatisfaction}</p>
              <p className="text-xs text-muted-foreground">平均满意度</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">用户反馈详情</CardTitle>
            <Button size="sm" variant="outline" onClick={exportFeedback} disabled={feedbacks.length === 0}>
              <Download className="w-4 h-4 mr-1" />导出CSV
            </Button>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无反馈数据</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>满意度</TableHead>
                    <TableHead>效率评分</TableHead>
                    <TableHead>付费意愿</TableHead>
                    <TableHead>评论</TableHead>
                    <TableHead>可访谈</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map(f => (
                    <TableRow key={f.id}>
                      <TableCell>{"⭐".repeat(f.satisfaction_rating)}</TableCell>
                      <TableCell>{f.efficiency_rating || "-"}</TableCell>
                      <TableCell className="text-xs">{f.willingness_to_pay || "-"}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{f.comments || "-"}</TableCell>
                      <TableCell>{f.interview_available ? "✅" : "-"}</TableCell>
                      <TableCell className="text-xs">{new Date(f.created_at).toLocaleDateString("zh-CN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAnalytics;

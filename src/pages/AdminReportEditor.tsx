import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Scale, ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RiskClause {
  title: string;
  level: "high" | "medium" | "low";
  description: string;
  original_text: string;
}

interface Suggestion {
  issue: string;
  suggestion: string;
  reason: string;
}

const AdminReportEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contract, setContract] = useState<any>(null);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [overallRisk, setOverallRisk] = useState("medium");
  const [summary, setSummary] = useState("");
  const [overview, setOverview] = useState<Record<string, string>>({
    "合同类型": "", "签约方A": "", "签约方B": "", "签约日期": "", "有效期": "",
  });
  const [clauses, setClauses] = useState<RiskClause[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    const { data: c } = await supabase.from("contracts").select("*").eq("id", id!).single();
    if (c) setContract(c);

    const { data: r } = await supabase.from("review_reports").select("*").eq("contract_id", id!).single();
    if (r) {
      setExistingReport(r);
      setOverallRisk(r.overall_risk_level);
      setSummary(r.summary || "");
      if (r.contract_overview && typeof r.contract_overview === "object") setOverview(r.contract_overview as any);
      if (Array.isArray(r.risk_clauses)) setClauses(r.risk_clauses as any);
      if (Array.isArray(r.suggestions)) setSuggestions(r.suggestions as any);
    }
    setLoading(false);
  };

  const addClause = () => setClauses([...clauses, { title: "", level: "medium", description: "", original_text: "" }]);
  const removeClause = (i: number) => setClauses(clauses.filter((_, idx) => idx !== i));
  const updateClause = (i: number, field: string, value: string) => {
    const updated = [...clauses];
    (updated[i] as any)[field] = value;
    setClauses(updated);
  };

  const addSuggestion = () => setSuggestions([...suggestions, { issue: "", suggestion: "", reason: "" }]);
  const removeSuggestion = (i: number) => setSuggestions(suggestions.filter((_, idx) => idx !== i));
  const updateSuggestion = (i: number, field: string, value: string) => {
    const updated = [...suggestions];
    (updated[i] as any)[field] = value;
    setSuggestions(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      contract_id: id!,
      operator_id: user.id,
      overall_risk_level: overallRisk,
      summary,
      contract_overview: overview as any,
      risk_clauses: clauses as any,
      suggestions: suggestions as any,
    };

    let error;
    if (existingReport) {
      ({ error } = await supabase.from("review_reports").update(payload).eq("id", existingReport.id));
    } else {
      ({ error } = await supabase.from("review_reports").insert([payload]));
    }

    if (!error) {
      // Update contract status
      await supabase.from("contracts").update({ status: "completed" }).eq("id", id!);
      toast({ title: "保存成功", description: "审查报告已保存" });
      navigate("/admin");
    } else {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-4 h-4" />返回队列
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">报告编辑器</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* 合同信息 */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm"><strong>文件名：</strong>{contract?.file_name}</p>
            <p className="text-sm"><strong>类型：</strong>{contract?.contract_type === "nda" ? "保密协议" : "试用协议"}</p>
            <p className="text-sm"><strong>上传时间：</strong>{new Date(contract?.uploaded_at).toLocaleString("zh-CN")}</p>
          </CardContent>
        </Card>

        {/* 整体风险评级 */}
        <Card>
          <CardHeader><CardTitle className="text-lg">整体风险评级</CardTitle></CardHeader>
          <CardContent>
            <Select value={overallRisk} onValueChange={setOverallRisk}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低风险</SelectItem>
                <SelectItem value="medium">中风险</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 合同概览 */}
        <Card>
          <CardHeader><CardTitle className="text-lg">合同概览</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {Object.entries(overview).map(([k, v]) => (
              <div key={k}>
                <Label className="text-sm">{k}</Label>
                <Input value={v} onChange={e => setOverview({ ...overview, [k]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 摘要 */}
        <Card>
          <CardHeader><CardTitle className="text-lg">审查摘要</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="填写合同审查摘要..." />
          </CardContent>
        </Card>

        {/* 风险条款 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">风险条款</CardTitle>
            <Button size="sm" variant="outline" onClick={addClause}><Plus className="w-4 h-4 mr-1" />添加</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {clauses.map((c, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">条款 {i + 1}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeClause(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div><Label className="text-xs">标题</Label><Input value={c.title} onChange={e => updateClause(i, "title", e.target.value)} /></div>
                  <div><Label className="text-xs">风险等级</Label>
                    <Select value={c.level} onValueChange={v => updateClause(i, "level", v)}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label className="text-xs">描述</Label><Textarea value={c.description} onChange={e => updateClause(i, "description", e.target.value)} rows={2} /></div>
                <div><Label className="text-xs">原文引用</Label><Textarea value={c.original_text} onChange={e => updateClause(i, "original_text", e.target.value)} rows={2} /></div>
              </div>
            ))}
            {clauses.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">暂无风险条款，点击"添加"按钮</p>}
          </CardContent>
        </Card>

        {/* 修改建议 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">修改建议</CardTitle>
            <Button size="sm" variant="outline" onClick={addSuggestion}><Plus className="w-4 h-4 mr-1" />添加</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((s, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">建议 {i + 1}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeSuggestion(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div><Label className="text-xs">问题描述</Label><Input value={s.issue} onChange={e => updateSuggestion(i, "issue", e.target.value)} /></div>
                <div><Label className="text-xs">修改建议</Label><Textarea value={s.suggestion} onChange={e => updateSuggestion(i, "suggestion", e.target.value)} rows={2} /></div>
                <div><Label className="text-xs">理由说明</Label><Textarea value={s.reason} onChange={e => updateSuggestion(i, "reason", e.target.value)} rows={2} /></div>
              </div>
            ))}
            {suggestions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">暂无修改建议，点击"添加"按钮</p>}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />{saving ? "保存中..." : "保存并发布报告"}
        </Button>
      </main>
    </div>
  );
};

export default AdminReportEditor;

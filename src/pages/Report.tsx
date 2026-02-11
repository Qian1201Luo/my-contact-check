import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Scale, ArrowLeft, AlertTriangle, CheckCircle, Info, Star, MessageSquare, ThumbsUp, ThumbsDown, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RiskClause {
  title: string;
  level: "high" | "medium" | "low";
  description: string;
  original_text?: string;
}

interface Suggestion {
  issue: string;
  suggestion: string;
  reason: string;
}

interface Report {
  id: string;
  contract_id: string;
  overall_risk_level: string;
  summary: string;
  contract_overview: Record<string, string>;
  risk_clauses: RiskClause[];
  suggestions: Suggestion[];
}

interface SuggestionResponse {
  suggestion_index: number;
  action: string;
  reason: string;
}

const Report = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, SuggestionResponse>>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [willingness, setWillingness] = useState("");
  const [comments, setComments] = useState("");
  const [interviewAvailable, setInterviewAvailable] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    // Fetch contract
    const { data: contractData } = await supabase
      .from("contracts").select("*").eq("id", id!).single();
    if (contractData) setContract(contractData);

    // Fetch report
    const { data: reportData } = await supabase
      .from("review_reports").select("*").eq("contract_id", id!).single();
    if (reportData) {
      setReport(reportData as any);
      // Fetch existing responses
      const { data: resps } = await supabase
        .from("suggestion_responses").select("*").eq("report_id", reportData.id);
      if (resps) {
        const map: Record<number, SuggestionResponse> = {};
        resps.forEach((r: any) => { map[r.suggestion_index] = r; });
        setResponses(map);
      }
    }

    // Check existing feedback
    if (reportData) {
      const { data: fb } = await supabase
        .from("report_feedback").select("*").eq("report_id", reportData.id).eq("user_id", user!.id);
      if (fb && fb.length > 0) setFeedbackSubmitted(true);
    }
    setLoading(false);
  };

  const handleSuggestionAction = async (index: number, action: string, reason: string) => {
    if (!report || !user) return;
    // Upsert
    const existing = responses[index];
    if (existing) {
      await supabase.from("suggestion_responses")
        .update({ action, reason })
        .eq("report_id", report.id)
        .eq("suggestion_index", index)
        .eq("user_id", user.id);
    } else {
      await supabase.from("suggestion_responses").insert({
        report_id: report.id, suggestion_index: index, user_id: user.id, action, reason,
      });
    }
    setResponses(prev => ({ ...prev, [index]: { suggestion_index: index, action, reason } }));
    toast({ title: "已保存", description: "您的反馈已记录" });
  };

  const handleFeedbackSubmit = async () => {
    if (!report || !user || satisfaction === 0) return;
    setSubmittingFeedback(true);
    const { error } = await supabase.from("report_feedback").insert({
      report_id: report.id, user_id: user.id,
      satisfaction_rating: satisfaction, efficiency_rating: efficiency || null,
      willingness_to_pay: willingness || null, comments: comments || null,
      interview_available: interviewAvailable,
    });
    setSubmittingFeedback(false);
    if (error) {
      toast({ title: "提交失败", description: error.message, variant: "destructive" });
    } else {
      setFeedbackSubmitted(true);
      toast({ title: "感谢您的反馈！", description: "您的意见对我们非常重要" });
    }
  };

  const riskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  const riskLabel = (level: string) => {
    switch (level) {
      case "high": return "高风险";
      case "medium": return "中风险";
      case "low": return "低风险";
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary text-primary-foreground py-4 px-6">
          <div className="container mx-auto flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">AI合同审查助手</span>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <Info className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">报告尚未生成</h2>
          <p className="text-muted-foreground mb-6">您的合同正在审查中，请稍后再来查看。</p>
          <Button asChild><Link to="/dashboard">返回仪表盘</Link></Button>
        </main>
      </div>
    );
  }

  const overview = (report.contract_overview || {}) as Record<string, string>;
  const clauses = (report.risk_clauses || []) as RiskClause[];
  const suggestions = (report.suggestions || []) as Suggestion[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />返回仪表盘
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">AI合同审查助手</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* 报告头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">审查报告</h1>
            <p className="text-muted-foreground text-sm">{contract?.file_name}</p>
          </div>
          <Badge className={`${riskColor(report.overall_risk_level)} text-white text-sm px-3 py-1`}>
            整体评级：{riskLabel(report.overall_risk_level)}
          </Badge>
        </div>

        {/* 合同概览 */}
        {Object.keys(overview).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">📋 合同概览</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(overview).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* 摘要 */}
        {report.summary && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{report.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* 风险条款 */}
        {clauses.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">⚠️ 风险条款清单</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {clauses.map((clause, i) => (
                  <AccordionItem key={i} value={`clause-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge className={`${riskColor(clause.level)} text-white text-xs`}>
                          {riskLabel(clause.level)}
                        </Badge>
                        <span className="text-sm font-medium">{clause.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm">
                      <p>{clause.description}</p>
                      {clause.original_text && (
                        <blockquote className="border-l-2 border-muted pl-3 text-muted-foreground italic">
                          {clause.original_text}
                        </blockquote>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* 修改建议 */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">💡 修改建议</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((s, i) => (
                <SuggestionCard
                  key={i}
                  index={i}
                  suggestion={s}
                  response={responses[i]}
                  onAction={handleSuggestionAction}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* 免责声明 */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">免责声明</p>
                <p>本报告由AI辅助生成，仅供参考，不构成法律意见。重要合同事项请咨询专业律师。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 反馈收集 */}
        {feedbackSubmitted ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-800">感谢您的反馈！</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-lg">📝 使用反馈</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* 满意度 */}
              <div>
                <label className="text-sm font-medium mb-2 block">报告满意度 *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setSatisfaction(n)}
                      className={`p-1 transition-colors ${satisfaction >= n ? "text-gold" : "text-muted-foreground/30"}`}>
                      <Star className="w-7 h-7" fill={satisfaction >= n ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 效率感知 */}
              <div>
                <label className="text-sm font-medium mb-2 block">相比人工审查，您觉得效率如何？</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setEfficiency(n)}
                      className={`px-3 py-1 rounded border text-sm transition-colors ${efficiency === n ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {n}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground self-center ml-1">1=很慢 5=非常快</span>
                </div>
              </div>

              {/* 付费意愿 */}
              <div>
                <label className="text-sm font-medium mb-2 block">您愿意为此类服务付费吗？</label>
                <div className="flex flex-wrap gap-2">
                  {["愿意，每份50-100元", "愿意，每份100-300元", "愿意，按月订阅", "需要再看看", "不愿意"].map(opt => (
                    <button key={opt} onClick={() => setWillingness(opt)}
                      className={`px-3 py-1.5 rounded border text-sm transition-colors ${willingness === opt ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 评论 */}
              <div>
                <label className="text-sm font-medium mb-2 block">其他建议或意见</label>
                <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="请分享您的想法..." rows={3} />
              </div>

              {/* 访谈预约 */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={interviewAvailable} onChange={e => setInterviewAvailable(e.target.checked)}
                  className="rounded border-input" />
                我愿意参加15分钟的用户访谈（可获得额外奖励）
              </label>

              <Button onClick={handleFeedbackSubmit} disabled={satisfaction === 0 || submittingFeedback} className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                {submittingFeedback ? "提交中..." : "提交反馈"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Suggestion card with action buttons
const SuggestionCard = ({ index, suggestion, response, onAction }: {
  index: number; suggestion: Suggestion; response?: SuggestionResponse;
  onAction: (index: number, action: string, reason: string) => void;
}) => {
  const [selectedAction, setSelectedAction] = useState(response?.action || "");
  const [reason, setReason] = useState(response?.reason || "");

  const actions = [
    { key: "accept", label: "采纳", icon: ThumbsUp, color: "text-green-600" },
    { key: "reject", label: "拒绝", icon: ThumbsDown, color: "text-red-600" },
    { key: "discuss", label: "需讨论", icon: HelpCircle, color: "text-amber-600" },
  ];

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <p className="font-medium text-sm">问题：{suggestion.issue}</p>
        <p className="text-sm text-primary mt-1">建议：{suggestion.suggestion}</p>
        <p className="text-xs text-muted-foreground mt-1">理由：{suggestion.reason}</p>
      </div>
      <div className="flex items-center gap-2">
        {actions.map(a => (
          <Button key={a.key} variant={selectedAction === a.key ? "default" : "outline"} size="sm"
            onClick={() => setSelectedAction(a.key)} className="gap-1">
            <a.icon className={`w-3 h-3 ${selectedAction !== a.key ? a.color : ""}`} />
            {a.label}
          </Button>
        ))}
      </div>
      {selectedAction && (
        <div className="flex gap-2">
          <Textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="请简要说明原因..." rows={2} className="text-sm" />
          <Button size="sm" onClick={() => onAction(index, selectedAction, reason)}
            disabled={!reason.trim()}>保存</Button>
        </div>
      )}
    </div>
  );
};

export default Report;

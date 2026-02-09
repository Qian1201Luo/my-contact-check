import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, AlertCircle, Info, Lightbulb, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// 示例报告数据
const sampleReportData = {
  contractInfo: {
    type: "保密协议 (NDA)",
    partyA: "甲方科技有限公司",
    partyB: "乙方咨询有限公司",
    signDate: "2024年1月15日",
    effectiveDate: "2024年1月15日",
    expiryDate: "2027年1月14日",
  },
  overallRisk: "中等",
  riskDistribution: {
    high: 2,
    medium: 3,
    low: 1,
  },
  risks: [
    {
      id: 1,
      level: "high",
      title: "保密期限过长",
      clause: "第5条：保密期限自本协议生效之日起持续至保密信息公开后10年。",
      issue: "保密期限为\"公开后10年\"属于不确定期限，可能导致无限期保密义务。",
      suggestion: "建议修改为固定期限，如\"自本协议终止之日起3年\"或\"自披露之日起5年\"。",
      reason: "不确定的保密期限可能使贵方承担难以预见的长期义务，增加合规成本和法律风险。",
    },
    {
      id: 2,
      level: "high",
      title: "违约金条款过高",
      clause: "第8条：如一方违反本协议任何条款，应向守约方支付人民币500万元作为违约金。",
      issue: "违约金金额固定且过高，与实际损失可能不成比例。",
      suggestion: "建议修改为\"实际损失的赔偿\"或设置合理的违约金上限（如合同金额的20%）。",
      reason: "根据《民法典》，过高的违约金可能被法院调低，但诉讼过程会增加时间和经济成本。",
    },
    {
      id: 3,
      level: "medium",
      title: "保密信息定义过于宽泛",
      clause: "第2条：保密信息包括但不限于甲方提供的所有信息、数据、文件及口头沟通内容。",
      issue: "\"所有信息\"的定义过于宽泛，可能导致正常商业活动受限。",
      suggestion: "建议明确列举保密信息的类型，如\"技术资料、商业计划、客户名单、财务数据等\"。",
      reason: "过于宽泛的定义可能导致贵方在日常经营中无意违约。",
    },
    {
      id: 4,
      level: "medium",
      title: "单方解除权不平等",
      clause: "第10条：甲方有权随时书面通知乙方终止本协议，无需说明理由。",
      issue: "只有甲方享有无理由解除权，双方权利不对等。",
      suggestion: "建议增加对等条款：\"任一方可提前30日书面通知对方终止本协议\"。",
      reason: "单边解除权可能使贵方处于被动地位，影响业务连续性规划。",
    },
    {
      id: 5,
      level: "medium",
      title: "争议解决条款不利",
      clause: "第12条：因本协议产生的争议，由甲方所在地人民法院管辖。",
      issue: "约定由对方所在地法院管辖可能增加诉讼成本。",
      suggestion: "建议修改为\"被告所在地法院管辖\"或约定仲裁解决。",
      reason: "异地诉讼将增加律师费、差旅费等成本，且可能存在地方保护主义风险。",
    },
    {
      id: 6,
      level: "low",
      title: "通知送达方式可优化",
      clause: "第11条：本协议项下的通知应以挂号信方式送达。",
      issue: "仅限挂号信送达可能导致通知延迟。",
      suggestion: "建议增加电子邮件、传真等方式作为有效送达途径。",
      reason: "现代商业环境中，电子通信更为便捷高效。",
    },
  ],
};

const SampleReport = () => {
  const [expandedRisks, setExpandedRisks] = useState<number[]>([1, 2]);

  const toggleRisk = (id: number) => {
    setExpandedRisks((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">高风险</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 hover:bg-amber-600">中风险</Badge>;
      default:
        return <Badge variant="secondary">低风险</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">AI合同审查助手</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 样例报告标识 */}
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-foreground">
            📋 这是一份<strong>样例报告</strong>，展示 AI 合同审查的分析能力。
            <Link to="/auth" className="text-primary font-medium ml-2 hover:underline">
              立即注册体验真实审查 →
            </Link>
          </p>
        </div>

        {/* 合同概览 */}
        <Card className="mb-8">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <CardTitle>合同概览</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="合同类型" value={sampleReportData.contractInfo.type} />
              <InfoRow label="甲方" value={sampleReportData.contractInfo.partyA} />
              <InfoRow label="乙方" value={sampleReportData.contractInfo.partyB} />
              <InfoRow label="签署日期" value={sampleReportData.contractInfo.signDate} />
              <InfoRow label="生效日期" value={sampleReportData.contractInfo.effectiveDate} />
              <InfoRow label="到期日期" value={sampleReportData.contractInfo.expiryDate} />
            </div>
          </CardContent>
        </Card>

        {/* 整体风险评估 */}
        <Card className="mb-8">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              整体风险评估
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-amber-600">
                    {sampleReportData.overallRisk}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">整体风险等级</p>
              </div>
              <div className="flex-1 w-full">
                <div className="space-y-3">
                  <RiskBar label="高风险" count={sampleReportData.riskDistribution.high} color="bg-destructive" />
                  <RiskBar label="中风险" count={sampleReportData.riskDistribution.medium} color="bg-amber-500" />
                  <RiskBar label="低风险" count={sampleReportData.riskDistribution.low} color="bg-blue-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 风险条款清单 */}
        <Card className="mb-8">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              风险条款清单
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {sampleReportData.risks.map((risk) => (
              <Collapsible
                key={risk.id}
                open={expandedRisks.includes(risk.id)}
                onOpenChange={() => toggleRisk(risk.id)}
              >
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getRiskIcon(risk.level)}
                        <span className="font-medium text-left">{risk.title}</span>
                        {getRiskBadge(risk.level)}
                      </div>
                      {expandedRisks.includes(risk.id) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t bg-muted/20">
                      <div className="pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">📄 原条款</h4>
                        <p className="text-sm bg-card p-3 rounded border italic">"{risk.clause}"</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">⚠️ 问题分析</h4>
                        <p className="text-sm">{risk.issue}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-gold" />
                          修改建议
                        </h4>
                        <p className="text-sm text-primary">{risk.suggestion}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">💡 建议理由</h4>
                        <p className="text-sm text-muted-foreground">{risk.reason}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">免责声明</h4>
                <p className="text-sm text-amber-700">
                  本报告由 AI 系统自动生成，仅供参考使用，不构成法律意见或法律服务。
                  合同审查涉及复杂的法律问题，建议您在做出重要决策前咨询专业律师。
                  本系统及其运营方不对使用本报告产生的任何后果承担责任。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">想要审查您自己的合同？</p>
          <Button size="lg" className="bg-gold hover:bg-gold-dark text-navy-dark font-semibold" asChild>
            <Link to="/auth">立即注册，开始审查</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-dashed last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const RiskBar = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm w-16">{label}</span>
    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${color} flex items-center justify-end pr-2`}
        style={{ width: `${(count / 6) * 100}%` }}
      >
        <span className="text-xs text-white font-medium">{count}</span>
      </div>
    </div>
  </div>
);

export default SampleReport;

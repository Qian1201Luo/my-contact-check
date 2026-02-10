import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload as UploadIcon, FileText, AlertTriangle, Shield, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [contractType, setContractType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast({ title: "文件格式错误", description: "仅支持PDF格式", variant: "destructive" });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
    } else {
      toast({ title: "文件格式错误", description: "仅支持PDF格式", variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!file || !contractType || !user) return;
    setUploading(true);
    setProgress(20);

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    setProgress(50);
    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "上传失败", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(80);
    const { error: dbError } = await supabase.from("contracts").insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      contract_type: contractType,
    });

    if (dbError) {
      toast({ title: "记录创建失败", description: dbError.message, variant: "destructive" });
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    toast({ title: "上传成功", description: "合同已提交，我们将尽快为您审查。" });
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            ← 返回仪表盘
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-semibold">AI合同审查助手</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* 安全提示 */}
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">脱敏提醒</p>
                <p>请确保上传前已对合同进行脱敏处理（替换真实姓名、地址、身份证号等敏感信息）。</p>
                <p className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  您的文件将在上传后48小时内自动删除。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 合同类型选择 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">选择合同类型</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger>
                <SelectValue placeholder="请选择合同类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nda">保密协议 (NDA)</SelectItem>
                <SelectItem value="trial_agreement">试用协议</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 文件上传区 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">上传合同文件</CardTitle>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">拖拽文件到此处或点击选择</p>
                <p className="text-sm text-muted-foreground">仅支持 PDF 格式，文件大小不超过 20MB</p>
                <input
                  id="file-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 50 ? "准备上传..." : progress < 80 ? "上传中..." : progress < 100 ? "创建记录..." : "上传完成！"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleUpload}
          className="w-full"
          size="lg"
          disabled={!file || !contractType || uploading}
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          {uploading ? "上传中..." : "提交合同审查"}
        </Button>
      </main>
    </div>
  );
};

export default Upload;

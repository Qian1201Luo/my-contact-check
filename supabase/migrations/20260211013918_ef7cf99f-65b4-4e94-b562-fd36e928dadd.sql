
-- Review reports table (operator fills this)
CREATE TABLE public.review_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL,
  overall_risk_level TEXT NOT NULL DEFAULT 'medium',
  summary TEXT,
  contract_overview JSONB DEFAULT '{}',
  risk_clauses JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Users can view reports for their own contracts
CREATE POLICY "Users can view reports for own contracts"
  ON public.review_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.contracts WHERE contracts.id = review_reports.contract_id AND contracts.user_id = auth.uid())
  );

-- Operators/admins can CRUD reports
CREATE POLICY "Operators can view all reports"
  ON public.review_reports FOR SELECT
  USING (has_role(auth.uid(), 'operator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can insert reports"
  ON public.review_reports FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'operator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can update reports"
  ON public.review_reports FOR UPDATE
  USING (has_role(auth.uid(), 'operator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can delete reports"
  ON public.review_reports FOR DELETE
  USING (has_role(auth.uid(), 'operator') OR has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_review_reports_updated_at
  BEFORE UPDATE ON public.review_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Suggestion responses table (user feedback on each suggestion)
CREATE TABLE public.suggestion_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.review_reports(id) ON DELETE CASCADE,
  suggestion_index INTEGER NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('accept', 'reject', 'discuss')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestion_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own suggestion responses"
  ON public.suggestion_responses FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Operators can view suggestion responses"
  ON public.suggestion_responses FOR SELECT
  USING (has_role(auth.uid(), 'operator') OR has_role(auth.uid(), 'admin'));

-- Feedback table (overall report feedback)
CREATE TABLE public.report_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.review_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  satisfaction_rating INTEGER NOT NULL CHECK (satisfaction_rating BETWEEN 1 AND 5),
  efficiency_rating INTEGER CHECK (efficiency_rating BETWEEN 1 AND 5),
  willingness_to_pay TEXT,
  comments TEXT,
  interview_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback"
  ON public.report_feedback FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all feedback"
  ON public.report_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can view all feedback"
  ON public.report_feedback FOR SELECT
  USING (has_role(auth.uid(), 'operator'));

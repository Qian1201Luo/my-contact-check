
-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('nda', 'trial_agreement')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own contracts"
  ON public.contracts FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Operators and admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (public.has_role(auth.uid(), 'operator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators and admins can update contracts"
  ON public.contracts FOR UPDATE
  USING (public.has_role(auth.uid(), 'operator') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

CREATE POLICY "Users can upload their own contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own contract files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Operators and admins can view all contract files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'contracts' AND (public.has_role(auth.uid(), 'operator') OR public.has_role(auth.uid(), 'admin')));

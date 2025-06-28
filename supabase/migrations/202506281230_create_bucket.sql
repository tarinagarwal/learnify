INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true);

CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resources'
        AND auth.role() = 'authenticated'
    );


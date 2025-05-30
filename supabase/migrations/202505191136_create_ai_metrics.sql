CREATE TABLE ai_metrics (
    id BIGSERIAL PRIMARY KEY,
    feature TEXT NOT NULL,
    provider TEXT NOT NULL,
    duration INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ai_metrics REPLICA IDENTITY FULL;

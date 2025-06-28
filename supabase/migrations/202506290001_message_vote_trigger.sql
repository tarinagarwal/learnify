CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT (new vote)
    IF TG_OP = 'INSERT' THEN
        UPDATE community_messages
        SET 
            upvotes = upvotes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE 0 END,
            downvotes = downvotes + CASE WHEN NEW.vote_type = 'downvote' THEN 1 ELSE 0 END
        WHERE id = NEW.message_id;
    
    -- Handle DELETE (vote removal)
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_messages
        SET 
            upvotes = upvotes - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE 0 END,
            downvotes = downvotes - CASE WHEN OLD.vote_type = 'downvote' THEN 1 ELSE 0 END
        WHERE id = OLD.message_id;
    
    -- Handle UPDATE (vote type change)
    ELSIF TG_OP = 'UPDATE' THEN
        -- First reverse the old vote
        UPDATE community_messages
        SET 
            upvotes = upvotes - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE 0 END,
            downvotes = downvotes - CASE WHEN OLD.vote_type = 'downvote' THEN 1 ELSE 0 END
        WHERE id = OLD.message_id;
        
        -- Then apply the new vote
        UPDATE community_messages
        SET 
            upvotes = upvotes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE 0 END,
            downvotes = downvotes + CASE WHEN NEW.vote_type = 'downvote' THEN 1 ELSE 0 END
        WHERE id = NEW.message_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to handle all operations
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON message_votes;
CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON message_votes
FOR EACH ROW EXECUTE FUNCTION update_vote_counts();
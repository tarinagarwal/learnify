"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, MessageCircle } from "lucide-react";

interface NewChatDialogProps {
  onChatCreated: (sessionId: string) => void;
}

export function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const [title, setTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateChat = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session, error } = await supabase
        .from("chat_sessions")
        .insert([
          {
            user_id: user.id,
            title: title || "New Chat",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onChatCreated(session.id);
      setIsOpen(false);
      setTitle("");
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 hover:border-primary/80 rounded-full transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/90 backdrop-blur-sm border-border text-card-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/20">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            Create New Chat
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter chat title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateChat()}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Give your chat a descriptive name to help you find it later
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

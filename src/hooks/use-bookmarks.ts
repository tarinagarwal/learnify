import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id?: string;
  course_id?: string;
  quiz_id?: string;
  type: "resource" | "course" | "quiz";
  created_at: string;
}

export function useBookmarks(type: "resource" | "course" | "quiz") {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    fetchBookmarks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchBookmarks = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (itemId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        [`${type}_id`]: itemId,
        type,
      });

      if (error) throw error;
      await fetchBookmarks();
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const removeBookmark = async (itemId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq(`${type}_id`, itemId);

      if (error) throw error;
      await fetchBookmarks();
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const isBookmarked = (itemId: string) => {
    return bookmarks.some((bookmark) => bookmark[`${type}_id`] === itemId);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
}

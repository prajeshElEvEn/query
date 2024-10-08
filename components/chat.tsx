"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { createClient } from "@/utils/supabase/client";
import QueryResponse from "./query-response";

export default function Chat({
  userId,
  user,
  queries,
}: {
  userId: string;
  user: any;
  queries: any;
}) {
  const supabase = createClient();

  const [newQueries, setNewQueries] = useState(queries);

  useEffect(() => {
    const channel = supabase
      .channel("realtime queries")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "queries",
        },
        (payload) => {
          if (payload.new.userId === userId) {
            setNewQueries((prevQueries: any) => [...prevQueries, payload.new]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queries, setNewQueries]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [newQueries]);

  return (
    <>
      {newQueries?.map((query: any) => (
        <div
          key={query?.id}
          className={`flex ${user?.full_name === query?.user?.full_name ? "justify-end" : "justify-start"}`}
        >
          <div className={`w-5/6 flex flex-col gap-2 border p-4 rounded-lg`}>
            <div
              className={`flex flex-col ${user?.full_name === query?.user?.full_name ? "items-end md:flex-row-reverse" : "items-start md:flex-row"}  md:items-center justify-between`}
            >
              <span className="font-semibold">{query?.user?.full_name}</span>
              <span className="text-muted-foreground text-sm">
                {moment(query?.created_at).format("MMM D, YYYY | h:mm a")}
              </span>
            </div>
            <div
              className={`flex ${user?.full_name === query?.user?.full_name ? "justify-end" : "justify-start"}`}
            >
              <QueryResponse markdown={query?.query} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

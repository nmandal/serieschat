"use client";

import { Activity, CheckCircle2, Database, XCircle } from "lucide-react";

import { Card } from "./ui/card";
import { SEMANTIC_COLORS } from "./imdb-design-tokens";

type HealthData = {
  status: string;
  database: string;
  titles_count: number;
  error?: string;
};

export function ImdbHealth({ data }: { data: HealthData }) {
  const isHealthy = data.status === "healthy";
  const colors = isHealthy ? SEMANTIC_COLORS.success : SEMANTIC_COLORS.error;

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3 border-b p-4">
        {isHealthy ? (
          <CheckCircle2 className={`size-5 ${colors.icon}`} />
        ) : (
          <XCircle className={`size-5 ${colors.icon}`} />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">IMDb Database Status</h3>
          <p className={`text-sm ${colors.icon}`}>
            {isHealthy ? "System Operational" : "System Error"}
          </p>
        </div>
        <Activity className="size-5 text-muted-foreground" />
      </div>

      <div className="space-y-3 p-4">
        {isHealthy ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Database</span>
              </div>
              <span className="font-mono text-sm">{data.database}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Total titles
              </span>
              <span className="font-semibold text-sm">
                {data.titles_count.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div
            className={`rounded-lg border p-3 ${colors.border} ${colors.bg}`}
          >
            <p className={`text-sm ${colors.icon}`}>
              {data.error || "Unable to connect to IMDb database"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

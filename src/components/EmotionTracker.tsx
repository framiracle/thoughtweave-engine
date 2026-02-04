import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCore } from "@/core/CoreContext";
import { Heart, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  trust: "#10b981",
  joy: "#f59e0b",
  curiosity: "#3b82f6",
  calm: "#8b5cf6",
  gratitude: "#ec4899",
  hope: "#06b6d4",
  love: "#f43f5e",
  sadness: "#6366f1",
  frustration: "#ef4444",
  confusion: "#a855f7",
};

const getEmotionColor = (emotion: string): string => {
  return EMOTION_COLORS[emotion.toLowerCase()] || "#94a3b8";
};

export default function EmotionTracker() {
  const { emotionalState, emotionalHistory } = useCore();

  // Transform emotional history for chart
  const chartData = useMemo(() => {
    if (emotionalHistory.length === 0) return [];

    // Get all unique emotions
    const allEmotions = new Set<string>();
    emotionalHistory.forEach((snapshot) => {
      Object.keys(snapshot.emotions).forEach((e) => allEmotions.add(e));
    });

    return emotionalHistory.map((snapshot, index) => {
      const point: Record<string, any> = {
        time: new Date(snapshot.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        index,
      };

      allEmotions.forEach((emotion) => {
        point[emotion] = snapshot.emotions[emotion] || 0;
      });

      return point;
    });
  }, [emotionalHistory]);

  // Get unique emotions for rendering lines
  const uniqueEmotions = useMemo(() => {
    const emotions = new Set<string>();
    emotionalHistory.forEach((snapshot) => {
      Object.keys(snapshot.emotions).forEach((e) => emotions.add(e));
    });
    return Array.from(emotions);
  }, [emotionalHistory]);

  // Current emotion bars
  const currentEmotions = Object.entries(emotionalState)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  const maxEmotionValue = Math.max(...currentEmotions.map(([, v]) => v), 1);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-pink-500" />
          Emotion Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Emotional State - Bar Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Current State
          </h4>
          {currentEmotions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No emotional patterns detected yet. Interact with Carolina to build emotional context.
            </p>
          ) : (
            <div className="space-y-2">
              {currentEmotions.slice(0, 6).map(([emotion, value]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-foreground">{emotion}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(value / maxEmotionValue) * 100}%`,
                        backgroundColor: getEmotionColor(emotion),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emotional History Chart */}
        {chartData.length > 1 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Emotional Evolution
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {uniqueEmotions.map((emotion) => (
                    <Area
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stroke={getEmotionColor(emotion)}
                      fill={getEmotionColor(emotion)}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Emotional Summary */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Emotions: {Object.keys(emotionalState).length}</span>
            <span>Snapshots: {emotionalHistory.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Sparkles, Lightbulb, Target, Zap } from "lucide-react";

interface PersonalityTrait {
  id: string;
  trait_name: string;
  trait_value: number;
  description: string;
  last_updated: string;
}

const traitIcons: Record<string, React.ReactNode> = {
  empathetic: <Heart className="w-5 h-5 text-rose-500" />,
  humorous: <Sparkles className="w-5 h-5 text-amber-500" />,
  formal: <Target className="w-5 h-5 text-slate-500" />,
  creative: <Lightbulb className="w-5 h-5 text-purple-500" />,
  analytical: <Brain className="w-5 h-5 text-blue-500" />,
  adaptive: <Zap className="w-5 h-5 text-emerald-500" />
};

export default function PersonalityTraits() {
  const [traits, setTraits] = useState<PersonalityTrait[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTraits();
  }, []);

  const loadTraits = async () => {
    const { data, error } = await supabase
      .from('personality_traits' as any)
      .select('*')
      .order('trait_value', { ascending: false });

    if (data) setTraits(data as any as PersonalityTrait[]);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading personality traits...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {traits.map((trait) => (
        <Card key={trait.id} className="p-4 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            {traitIcons[trait.trait_name] || <Brain className="w-5 h-5" />}
            <div className="flex-1">
              <h3 className="font-semibold capitalize text-foreground">
                {trait.trait_name}
              </h3>
              <p className="text-xs text-muted-foreground">{trait.description}</p>
            </div>
          </div>
          <Progress value={trait.trait_value * 100} className="h-2" />
          <p className="text-xs text-right mt-1 text-muted-foreground">
            {(trait.trait_value * 100).toFixed(0)}%
          </p>
        </Card>
      ))}
    </div>
  );
}

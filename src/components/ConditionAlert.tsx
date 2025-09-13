import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, Lightbulb } from "lucide-react";
import { useState } from "react";

interface HealthCondition {
  type: "fever" | "cold" | "stomach" | "headache" | "none";
  severity: "mild" | "moderate" | "severe";
}

// Mock user condition - in real app this would come from user settings
const userCondition: HealthCondition = {
  type: "fever",
  severity: "mild"
};

const conditionData = {
  fever: {
    emoji: "🤒",
    name: "Fever",
    badFoods: ["pizza", "ice cream", "spicy food"],
    goodFoods: ["warm soup", "herbal tea", "fruits"],
    alertMessage: "Not great for fever! Your body needs gentle, nourishing foods right now."
  },
  cold: {
    emoji: "🤧", 
    name: "Cold",
    badFoods: ["dairy", "cold drinks", "processed foods"],
    goodFoods: ["ginger tea", "chicken soup", "citrus fruits"],
    alertMessage: "Might make your cold worse! Try warming, immune-boosting foods instead."
  },
  stomach: {
    emoji: "🤢",
    name: "Stomach Upset", 
    badFoods: ["spicy food", "dairy", "fatty foods"],
    goodFoods: ["rice", "bananas", "toast"],
    alertMessage: "Could upset your stomach more! Stick to bland, easy-to-digest foods."
  }
};

export function ConditionAlert() {
  const [dismissed, setDismissed] = useState(false);
  
  // In real app, this would check if user recently logged problematic food
  const hasProblematicFood = true; // Mock - user logged pizza with fever
  
  if (userCondition.type === "none" || dismissed || !hasProblematicFood) {
    return null;
  }

  const condition = conditionData[userCondition.type];
  
  return (
    <Alert className="border-alert-warning bg-alert-warning/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{condition.emoji}</span>
            <Badge variant="outline" className="text-alert-warning border-alert-warning/30">
              {condition.name}
            </Badge>
          </div>
          
          <p className="text-sm font-medium text-alert-warning mb-2">
            ⚠️ Oops! {condition.alertMessage}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              <span className="font-medium">Try instead:</span>
            </div>
            {condition.goodFoods.slice(0, 2).map((food, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-battery-high/10 text-battery-high">
                {food}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
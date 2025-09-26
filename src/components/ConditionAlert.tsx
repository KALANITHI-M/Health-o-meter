import React, { useEffect, useState } from "react";
import { AlertCircle, Activity, CheckCircle } from "lucide-react";

interface Alert {
  type: "alert" | "info" | "success";
  message: string;
  recommendation?: string;
}

// ✅ Helper: Safely parse AI response into alerts
function parseHealthAlerts(aiResponse: string): Alert[] {
  console.log("🔍 Raw AI Response:", aiResponse);

  if (!aiResponse || aiResponse.trim().length === 0) {
    return [
      {
        type: "info",
        message: "No alerts generated.",
        recommendation: "Keep tracking your health regularly.",
      },
    ];
  }

  const alerts: Alert[] = [];

  // Example: AI outputs line-based recommendations
  const lines = aiResponse.split("\n").map((line) => line.trim());

  lines.forEach((line) => {
    if (line.includes("|")) {
      const [msg, rec] = line.split("|").map((s) => s.trim());
      alerts.push({
        type: line.toLowerCase().includes("alert") ? "alert" : "info",
        message: msg,
        recommendation: rec || undefined,
      });
    } else if (line.length > 0) {
      alerts.push({
        type: "info",
        message: line,
        recommendation: undefined,
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      message: "No critical health issues detected.",
      recommendation: "Maintain your healthy habits.",
    });
  }

  return alerts;
}

// ✅ AI Integration with better safety
async function analyzeHealthWithAI(healthData: any): Promise<Alert[]> {
  try {
    const response = await fetch("http://localhost:5050/api/ai/health-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "As a health AI analyst, analyze this user's health patterns and provide specific alerts if needed.",
        context: healthData,
      }),
    });

    const data = await response.json();
    console.log("🔍 Full AI API Response:", data);

    // ✅ Use flexible property fallback
    return parseHealthAlerts(
      data.response || data.text || data.message || "NO_ALERTS_NEEDED"
    );
  } catch (error) {
    console.error("❌ AI analysis error:", error);
    return [
      {
        type: "alert",
        message: "AI service unavailable.",
        recommendation: "Please try again later.",
      },
    ];
  }
}

// ✅ Mock fallback if APIs are missing
async function getCurrentHealthData() {
  try {
    const foodLogsResponse = await fetch("/api/food-logs/recent?days=3");
    const foodLogs = await foodLogsResponse.json();

    const activityResponse = await fetch("/api/activities/recent?days=3");
    const activities = await activityResponse.json();

    const profileResponse = await fetch("/api/user/profile");
    const profile = await profileResponse.json();

    return {
      foodLogs: foodLogs || [],
      activities: activities || [],
      profile: profile || {},
    };
  } catch (err) {
    console.warn("⚠️ Using mock health data:", err);
    return {
      foodLogs: [
        { item: "Rice", calories: 200 },
        { item: "Chicken", calories: 350 },
      ],
      activities: [{ type: "Running", duration: 30 }],
      profile: { age: 21, weight: 65, conditions: ["None"] },
    };
  }
}

const ConditionAlert: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const healthData = await getCurrentHealthData();
        console.log("📊 Current Health Data:", healthData);

        const aiAlerts = await analyzeHealthWithAI(healthData);
        setAlerts(aiAlerts);
      } catch (error) {
        console.error("❌ Error analyzing health:", error);
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        Analyzing your health patterns...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Activity className="mr-2 text-blue-500" /> Health Alerts
      </h3>
      {alerts.length === 0 ? (
        <p>No health alerts at the moment.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, index) => (
            <li
              key={index}
              className={`p-3 rounded-md flex items-start ${
                alert.type === "alert"
                  ? "bg-red-50 border border-red-200"
                  : alert.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              {alert.type === "alert" ? (
                <AlertCircle className="mr-2 text-red-500 mt-1" />
              ) : alert.type === "success" ? (
                <CheckCircle className="mr-2 text-green-500 mt-1" />
              ) : (
                <Activity className="mr-2 text-yellow-500 mt-1" />
              )}
              <div>
                <p className="font-medium">{alert.message}</p>
                {alert.recommendation && (
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.recommendation}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConditionAlert;

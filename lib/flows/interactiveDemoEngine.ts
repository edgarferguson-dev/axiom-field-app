export type InteractiveDemoStep =
  | "idle"
  | "phone"
  | "sending"
  | "ai-reply"
  | "scheduling"
  | "confirmed";

export type InteractiveDemoState = {
  step: InteractiveDemoStep;
  phone: string;
  transcript: { from: "buyer" | "ai"; text: string }[];
  booking: { dateLabel: string; timeLabel: string } | null;
};

export type InteractiveDemoEvent =
  | { type: "SET_PHONE"; phone: string }
  | { type: "START" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

export function createInitialInteractiveDemoState(): InteractiveDemoState {
  return {
    step: "phone",
    phone: "",
    transcript: [],
    booking: null,
  };
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `***-***-${digits.slice(-4)}`;
}

export function reduceInteractiveDemo(
  state: InteractiveDemoState,
  event: InteractiveDemoEvent
): InteractiveDemoState {
  if (event.type === "RESET") return createInitialInteractiveDemoState();

  if (event.type === "SET_PHONE") {
    return { ...state, phone: event.phone };
  }

  if (event.type === "START") {
    if (!state.phone.trim()) return state;
    return { ...state, step: "sending" };
  }

  if (event.type === "ADVANCE") {
    switch (state.step) {
      case "sending":
        return {
          ...state,
          step: "ai-reply",
          transcript: [
            ...state.transcript,
            { from: "buyer", text: `Hi — interested. This is ${maskPhone(state.phone)}.` },
            { from: "ai", text: "Great — I can get you booked in under a minute. What day works best?" },
          ],
        };
      case "ai-reply":
        return {
          ...state,
          step: "scheduling",
          transcript: [
            ...state.transcript,
            { from: "buyer", text: "Tomorrow afternoon." },
            { from: "ai", text: "Perfect. I have 2:30pm or 4:00pm available. Which do you prefer?" },
          ],
        };
      case "scheduling":
        return {
          ...state,
          step: "confirmed",
          booking: { dateLabel: "Tomorrow", timeLabel: "2:30pm" },
          transcript: [
            ...state.transcript,
            { from: "buyer", text: "2:30 works." },
            { from: "ai", text: "Booked. You’ll receive a confirmation message and a reminder before the appointment." },
          ],
        };
      default:
        return state;
    }
  }

  return state;
}


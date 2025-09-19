interface TrackingEvent {
  status: string;
  description?: string;
  location?: string;
  timestamp: string;
}

interface TrackingResponse {
  status: string;
  events: TrackingEvent[];
}

const FALLBACK_EVENTS: TrackingEvent[] = [
  {
    status: "PROCESSING",
    description: "Order received and being prepared",
    timestamp: new Date().toISOString(),
  },
];

export async function fetchTrackingStatus(
  trackingNumber: string,
  carrier?: string,
): Promise<TrackingResponse> {
  const endpoint = process.env.TRACKING_API_URL;
  const apiKey = process.env.TRACKING_API_KEY;

  if (endpoint && apiKey) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("trackingNumber", trackingNumber);
      if (carrier) {
        url.searchParams.set("carrier", carrier);
      }
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (response.ok) {
        const json = (await response.json()) as {
          status?: string;
          events?: TrackingEvent[];
        };
        if (json && json.status) {
          return {
            status: json.status,
            events: json.events ?? [],
          };
        }
      } else {
        console.warn("Tracking provider returned", response.status);
      }
    } catch (error) {
      console.error("Tracking provider error", error);
    }
  }

  return {
    status: FALLBACK_EVENTS[0]?.status ?? "PENDING",
    events: FALLBACK_EVENTS,
  };
}

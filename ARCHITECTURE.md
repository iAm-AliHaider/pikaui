# pikAui - Voice-Powered Generative UI Platform

## Vision
A multimodal agent that **speaks** to users via voice AND **drives** the UI in real-time. 
Voice says "show me the blue shirt" → screen instantly renders a ProductCard.
Voice says "fill in my name as Ali" → form field auto-populates.

## Tech Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Generative UI:** Tambo SDK (@tambo-ai/react) — AI picks & renders components
- **Voice:** LiveKit Client SDK (@livekit/components-react) — real-time voice
- **Agent Backend:** Python LiveKit Agents SDK — voice agent with function calling
- **LLM:** GPT-4o-mini (fast, cheap, great tool use)
- **STT:** Deepgram Nova-3
- **TTS:** OpenAI TTS (or Kokoro local)

## Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │  LiveKit     │  │  Tambo Provider      │  │
│  │  Voice UI    │  │  ┌────────────────┐  │  │
│  │  (mic/audio) │  │  │ ProductCard    │  │  │
│  │              │  │  │ FormStep       │  │  │
│  │              │  │  │ ApprovalCard   │  │  │
│  │              │  │  │ Chart          │  │  │
│  │              │  │  │ StatusBanner   │  │  │
│  │              │  │  └────────────────┘  │  │
│  └──────┬──────┘  └──────────┬───────────┘  │
│         │                    │               │
│         │  LiveKit Data Channel              │
│         │  (JSON messages for UI sync)       │
│         └────────────┬───────┘               │
└──────────────────────┼───────────────────────┘
                       │
              ┌────────┴────────┐
              │  LiveKit Cloud  │
              │  (SFU Server)   │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │  Python Agent   │
              │  ┌────────────┐ │
              │  │ GPT-4o-mini│ │
              │  │ + Tools:   │ │
              │  │ show_product│ │
              │  │ update_form │ │
              │  │ show_chart  │ │
              │  │ approve_req │ │
              │  └────────────┘ │
              └─────────────────┘
```

## Data Flow
1. User speaks → LiveKit captures audio → Deepgram STT → text
2. Text → GPT-4o-mini with function calling
3. If LLM calls a UI function (e.g., `show_product`):
   - Agent sends JSON via LiveKit Data Channel to frontend
   - Frontend receives JSON, Tambo renders the matching component
4. LLM also generates spoken response → TTS → audio back to user
5. User sees UI update AND hears the agent simultaneously

## Component Registry (Tambo)

### 1. ProductCard
```typescript
propsSchema: z.object({
  name: z.string(),
  price: z.number(),
  image: z.string().url(),
  description: z.string(),
  color: z.string().optional(),
  inStock: z.boolean(),
})
```

### 2. FormStep
```typescript
propsSchema: z.object({
  title: z.string(),
  fields: z.array(z.object({
    label: z.string(),
    value: z.string(),
    type: z.enum(["text", "email", "phone", "select"]),
    filled: z.boolean(),
  })),
  step: z.number(),
  totalSteps: z.number(),
})
```

### 3. ApprovalCard
```typescript
propsSchema: z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  actions: z.array(z.string()),
})
```

### 4. DataChart
```typescript
propsSchema: z.object({
  title: z.string(),
  data: z.array(z.object({ name: z.string(), value: z.number() })),
  type: z.enum(["bar", "line", "pie"]),
})
```

### 5. StatusBanner
```typescript
propsSchema: z.object({
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  progress: z.number().optional(),
})
```

## Directory Structure
```
pikaui/
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Main page with voice + UI
│   │   └── api/
│   │       └── token/route.ts  # LiveKit token endpoint
│   ├── components/
│   │   ├── pikaui/        # Tambo generative components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── FormStep.tsx
│   │   │   ├── ApprovalCard.tsx
│   │   │   ├── DataChart.tsx
│   │   │   └── StatusBanner.tsx
│   │   ├── VoiceAgent.tsx     # LiveKit voice controls
│   │   ├── GenerativePanel.tsx # Tambo-powered UI panel
│   │   └── PikAuiProvider.tsx # Combined Tambo + LiveKit provider
│   ├── lib/
│   │   ├── tambo-components.ts  # Component registry
│   │   ├── livekit-config.ts    # LiveKit connection
│   │   └── data-channel.ts     # LiveKit data message handler
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── agent/                 # Python LiveKit agent
│   ├── agent.py           # Main agent with voice + UI tools
│   ├── tools.py           # UI function definitions
│   ├── requirements.txt
│   └── .env
├── README.md
└── ARCHITECTURE.md
```

## Key Integration: LiveKit Data Channel + Tambo

The bridge between voice and UI:

```python
# Agent side (Python) — when LLM calls show_product tool
async def show_product(name, price, image, description):
    await ctx.room.local_participant.publish_data(
        json.dumps({
            "type": "tambo_render",
            "component": "ProductCard",
            "props": {"name": name, "price": price, "image": image, "description": description}
        }).encode(),
        topic="ui_sync"
    )
    return f"Showing {name} on screen"
```

```typescript
// Frontend side — listening for data messages
room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
  if (topic === "ui_sync") {
    const msg = JSON.parse(new TextDecoder().decode(payload));
    if (msg.type === "tambo_render") {
      // Inject into Tambo's message stream or render directly
      addGenerativeComponent(msg.component, msg.props);
    }
  }
});
```

## Demo Scenarios

### 1. Retail Assistant
"Show me running shoes under $100" → ProductCards appear
"I like the blue ones" → Card highlights, agent confirms
"Add to cart" → ApprovalCard with total

### 2. Interview/Onboarding
"Hi, I'm Ali from Karachi" → FormStep auto-fills name + city
"My email is ali@example.com" → Email field populates
"Submit my application" → StatusBanner shows success

### 3. Analytics Dashboard
"Show me last month's sales" → DataChart renders bar graph
"Compare with previous month" → Chart updates with overlay
"Approve the Q1 budget" → ApprovalCard appears

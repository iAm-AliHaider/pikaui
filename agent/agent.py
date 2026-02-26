"""pikAui — Voice-Powered Generative UI Agent (LiveKit Agents v1.4+)."""

import logging
import os
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
    RunContext,
)
from livekit.plugins import deepgram, openai, silero

load_dotenv()

logger = logging.getLogger("pikaui-agent")

# ── TTS Backend Selection ───────────────────────────────
# Set PIKAUI_TTS=chattts to use ChatTTS (port 8001)
# Default: kokoro (Speaches on port 8000)
TTS_BACKEND = os.getenv("PIKAUI_TTS", "chattts").lower()

SYSTEM_PROMPT = """You are pikAui, a friendly voice assistant that can show things on the user's screen.

You have these UI tools:
1. show_product — Show a product card
2. update_form — Show/update a form
3. show_approval — Show an approve/reject card
4. show_chart — Show a data chart
5. show_status — Show a notification banner

RULES:
- Keep responses SHORT (1-2 sentences max, this is voice)
- When asked to show something, call the tool AND give a brief verbal response
- Use realistic placeholder images from picsum.photos (e.g. https://picsum.photos/400/300)
- Be quick and energetic
"""

import json

_room_ref = None


@function_tool()
async def show_product(
    context: RunContext,
    name: str,
    price: float,
    image: str,
    description: str,
    color: str = "default",
    in_stock: bool = True,
):
    """Display a product card on screen. Use for products, items, recommendations."""
    await _send_ui("ProductCard", {
        "name": name, "price": price, "image": image,
        "description": description, "color": color, "inStock": in_stock,
    })
    return f"Showing {name} on screen."


@function_tool()
async def update_form(
    context: RunContext,
    title: str,
    fields_json: str,
    step: int = 1,
    total_steps: int = 3,
):
    """Update a form on screen. fields_json: JSON array [{"label":"Name","value":"Ali","type":"text","filled":true}]"""
    try:
        fields = json.loads(fields_json)
    except Exception:
        fields = [{"label": "Info", "value": fields_json, "type": "text", "filled": True}]
    await _send_ui("FormStep", {"title": title, "fields": fields, "step": step, "totalSteps": total_steps})
    return f"Form updated: {title}"


@function_tool()
async def show_approval(
    context: RunContext,
    title: str,
    description: str,
    amount: float = 0,
    actions: str = "Approve,Reject",
):
    """Show an approval card for transactions or decisions."""
    await _send_ui("ApprovalCard", {
        "title": title, "description": description,
        "amount": amount if amount > 0 else None,
        "status": "pending",
        "actions": [a.strip() for a in actions.split(",")],
    })
    return f"Approval card shown: {title}"


@function_tool()
async def show_chart(
    context: RunContext,
    title: str,
    data_json: str,
    chart_type: str = "bar",
):
    """Display a chart. data_json: JSON array [{"name":"Jan","value":100}]"""
    try:
        data = json.loads(data_json)
    except Exception:
        data = [{"name": "Data", "value": 0}]
    await _send_ui("DataChart", {"title": title, "data": data, "type": chart_type})
    return f"Chart shown: {title}"


@function_tool()
async def show_status(
    context: RunContext,
    message: str,
    status_type: str = "info",
    progress: int = -1,
):
    """Show a status banner notification."""
    await _send_ui("StatusBanner", {
        "message": message, "type": status_type,
        "progress": progress if progress >= 0 else None,
    })
    return f"Status: {message}"


async def _send_ui(component: str, props: dict):
    global _room_ref
    if not _room_ref or not _room_ref.local_participant:
        logger.warning("No room, can't send UI")
        return
    payload = json.dumps({
        "type": "tambo_render",
        "component": component,
        "props": props,
    }).encode("utf-8")
    await _room_ref.local_participant.publish_data(payload, topic="ui_sync", reliable=True)
    logger.info(f"Sent UI: {component} -> {list(props.keys())}")


class PikAuiAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=[show_product, update_form, show_approval, show_chart, show_status],
        )


def get_tts():
    """Get TTS plugin based on PIKAUI_TTS env var."""
    if TTS_BACKEND == "chattts":
        logger.info("TTS: ChatTTS (localhost:8001)")
        return openai.TTS(
            model="chattts",
            voice="default",
            base_url="http://localhost:8001/v1",
            api_key="not-needed",
        )
    else:
        logger.info("TTS: Kokoro (localhost:8000)")
        return openai.TTS(
            model="speaches-ai/Kokoro-82M-v1.0-ONNX",
            voice="af_heart",
            base_url="http://localhost:8000/v1",
            api_key="not-needed",
        )


async def entrypoint(ctx: JobContext):
    global _room_ref
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _room_ref = ctx.room
    logger.info(f"Connected to room: {ctx.room.name}")

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="en"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=get_tts(),
    )

    await session.start(room=ctx.room, agent=PikAuiAgent())

    await session.say("Hey! I'm pikAui. Ask me to show you products, charts, or forms!", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="pikaui"))

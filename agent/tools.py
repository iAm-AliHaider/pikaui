"""pikAui — UI function tools for the voice agent.

These tools are called by the LLM during conversation. Each tool sends a
JSON payload over LiveKit Data Channel to the frontend, which renders the
corresponding Tambo component.
"""

import json
import logging
from typing import Annotated

from livekit.agents import llm

logger = logging.getLogger("pikaui-tools")


class PikAuiTools(llm.FunctionContext):
    """Voice agent tools that drive the frontend UI via LiveKit data channel."""

    def __init__(self):
        super().__init__()
        self._room = None

    def set_room(self, room):
        """Bind the LiveKit room so tools can publish data messages."""
        self._room = room

    async def _send_ui(self, component: str, props: dict):
        """Send a UI render command to the frontend via data channel."""
        if not self._room or not self._room.local_participant:
            logger.warning("No room connected, cannot send UI command")
            return
        payload = json.dumps({
            "type": "tambo_render",
            "component": component,
            "props": props,
        }).encode("utf-8")
        await self._room.local_participant.publish_data(
            payload, topic="ui_sync", reliable=True
        )
        logger.info(f"Sent UI command: {component}")

    @llm.ai_callable(description="Display a product card on the user's screen. Use when showing a product, item, or recommendation.")
    async def show_product(
        self,
        name: Annotated[str, llm.TypeInfo(description="Product name")],
        price: Annotated[float, llm.TypeInfo(description="Price in USD")],
        image: Annotated[str, llm.TypeInfo(description="Image URL for the product")],
        description: Annotated[str, llm.TypeInfo(description="Short product description")],
        color: Annotated[str, llm.TypeInfo(description="Product color")] = "default",
        in_stock: Annotated[bool, llm.TypeInfo(description="Whether in stock")] = True,
    ):
        await self._send_ui("ProductCard", {
            "name": name,
            "price": price,
            "image": image,
            "description": description,
            "color": color,
            "inStock": in_stock,
        })
        return f"Showing {name} (${price}) on the screen."

    @llm.ai_callable(description="Update a form on the user's screen. Use during interviews, onboarding, or data collection.")
    async def update_form(
        self,
        title: Annotated[str, llm.TypeInfo(description="Form section title")],
        fields_json: Annotated[str, llm.TypeInfo(description='JSON array of field objects: [{"label":"Name","value":"Ali","type":"text","filled":true}]')],
        step: Annotated[int, llm.TypeInfo(description="Current step number")] = 1,
        total_steps: Annotated[int, llm.TypeInfo(description="Total number of steps")] = 3,
    ):
        import json as _json
        try:
            fields = _json.loads(fields_json)
        except Exception:
            fields = [{"label": "Info", "value": fields_json, "type": "text", "filled": True}]

        await self._send_ui("FormStep", {
            "title": title,
            "fields": fields,
            "step": step,
            "totalSteps": total_steps,
        })
        filled = sum(1 for f in fields if f.get("filled"))
        return f"Form updated: {title} — step {step}/{total_steps}, {filled}/{len(fields)} fields filled."

    @llm.ai_callable(description="Show an approval or confirmation card. Use for transactions, orders, or decisions requiring user confirmation.")
    async def show_approval(
        self,
        title: Annotated[str, llm.TypeInfo(description="Approval title")],
        description: Annotated[str, llm.TypeInfo(description="What needs approval")],
        amount: Annotated[float, llm.TypeInfo(description="Amount if applicable")] = 0,
        actions: Annotated[str, llm.TypeInfo(description="Comma-separated action labels")] = "Approve,Reject",
    ):
        await self._send_ui("ApprovalCard", {
            "title": title,
            "description": description,
            "amount": amount if amount > 0 else None,
            "status": "pending",
            "actions": [a.strip() for a in actions.split(",")],
        })
        return f"Showing approval card: {title}. Waiting for user decision."

    @llm.ai_callable(description="Display a data chart on screen. Use when presenting analytics, comparisons, or metrics.")
    async def show_chart(
        self,
        title: Annotated[str, llm.TypeInfo(description="Chart title")],
        data_json: Annotated[str, llm.TypeInfo(description='JSON array: [{"name":"Jan","value":100},{"name":"Feb","value":150}]')],
        chart_type: Annotated[str, llm.TypeInfo(description="Chart type: bar, line, or pie")] = "bar",
    ):
        import json as _json
        try:
            data = _json.loads(data_json)
        except Exception:
            data = [{"name": "Data", "value": 0}]

        await self._send_ui("DataChart", {
            "title": title,
            "data": data,
            "type": chart_type,
        })
        return f"Showing {chart_type} chart: {title} with {len(data)} data points."

    @llm.ai_callable(description="Show a status notification banner. Use for confirmations, warnings, progress updates.")
    async def show_status(
        self,
        message: Annotated[str, llm.TypeInfo(description="Status message")],
        status_type: Annotated[str, llm.TypeInfo(description="Type: info, success, warning, or error")] = "info",
        progress: Annotated[int, llm.TypeInfo(description="Progress percentage 0-100, -1 for no progress bar")] = -1,
    ):
        await self._send_ui("StatusBanner", {
            "message": message,
            "type": status_type,
            "progress": progress if progress >= 0 else None,
        })
        return f"Status shown: [{status_type}] {message}"

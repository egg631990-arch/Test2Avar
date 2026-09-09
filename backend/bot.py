from fastapi import FastAPI, Request
from aiogram import Bot, Dispatcher, types
from aiogram.types import LabeledPrice, PreCheckoutQuery
from aiogram.fsm.storage.memory import MemoryStorage
import logging
import uvicorn
import os

BOT_TOKEN = "8887976613:AAHZhN4wZM_BjKy8Ha5OAFN9lGEjL7uWME4"

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
app = FastAPI()

# Хранилище балансов (для теста)
user_balances = {}

@app.post("/create-invoice")
async def create_invoice(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    stars_amount = data.get("stars_amount")
    if not user_id or not stars_amount or stars_amount < 1:
        return {"error": "Invalid data"}
    
    invoice_link = await bot.create_invoice_link(
        title="Пополнение баланса",
        description=f"Пополнение на {stars_amount} звёзд",
        payload=f"balance_{user_id}_{stars_amount}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label=f"{stars_amount} Stars", amount=stars_amount)]
    )
    return {"invoiceLink": invoice_link}

@app.post("/webhook")
async def webhook(request: Request):
    update_data = await request.json()
    update = types.Update(**update_data)
    
    if update.pre_checkout_query:
        await bot.answer_pre_checkout_query(update.pre_checkout_query.id, ok=True)
    
    if update.message and update.message.successful_payment:
        payment = update.message.successful_payment
        payload = payment.invoice_payload
        user_id = update.message.from_user.id
        parts = payload.split("_")
        if len(parts) == 3 and parts[0] == "balance":
            stars_amount = int(parts[2])
            user_balances[user_id] = user_balances.get(user_id, 0) + stars_amount
            logging.info(f"User {user_id} +{stars_amount} ⭐, balance: {user_balances[user_id]}")
    
    await dp.feed_update(bot, update)
    return {"ok": True}

@app.on_event("startup")
async def on_startup():
    webhook_url = os.getenv("WEBHOOK_URL", "https://ваш-сервис.onrender.com/webhook")
    await bot.set_webhook(url=webhook_url, drop_pending_updates=True)
    logging.info(f"Webhook set to {webhook_url}")

@app.on_event("shutdown")
async def on_shutdown():
    await bot.session.close()
    logging.info("Bot session closed")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

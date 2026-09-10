from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from aiogram import Bot, Dispatcher, types, Router
from aiogram.types import LabeledPrice, PreCheckoutQuery
import json

# Токен бота (получить у @BotFather)
BOT_TOKEN = "8887976613:AAHZhN4wZM_BjKy8Ha5OAFN9lGEjL7uWME4"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
router = Router()
app = FastAPI()

# Хранилище балансов пользователей (в продакшене используйте БД)
user_balances = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Устанавливаем вебхук при запуске
    webhook_url = "https://https://egg631990-arch.github.io/Test2Avar//webhookl"
    await bot.set_webhook(url=webhook_url, drop_pending_updates=True)
    yield
    await bot.delete_webhook()

app.router.lifespan_context = lifespan

# Эндпоинт для создания инвойса (вызывается из мини-приложения)
@app.post("/create-invoice")
async def create_invoice(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    stars_amount = data.get("stars_amount")
    
    if not user_id or not stars_amount or stars_amount < 1:
        return {"error": "Invalid data"}
    
    # Создаём ссылку на инвойс
    invoice_link = await bot.create_invoice_link(
        title="Пополнение баланса",
        description=f"Пополнение на {stars_amount} звёзд",
        payload=f"balance_{user_id}_{stars_amount}",  # уникальный идентификатор
        provider_token="",  # для Stars оставляем пустым
        currency="XTR",  # валюта Telegram Stars
        prices=[LabeledPrice(label=f"{stars_amount} Stars", amount=stars_amount)]
    )
    
    return {"invoiceLink": invoice_link}

# Обработка pre-checkout (подтверждение перед оплатой)
@router.pre_checkout_query()
async def pre_checkout_query(pre_checkout_q: PreCheckoutQuery):
    await bot.answer_pre_checkout_query(pre_checkout_q.id, ok=True)
if not user_id or not stars_amount or stars_amount < 10:
    return {"error": "Minimum amount is 10 stars"}

# Обработка вебхука (сюда Telegram присылает статус оплаты)
@app.post("/webhook")
async def webhook(request: Request):
    update_data = await request.json()
    update = types.Update(**update_data)
    
    # Проверяем, есть ли успешный платёж
    if update.message and update.message.successful_payment:
        payment = update.message.successful_payment
        payload = payment.invoice_payload  # "balance_123456_10"
        user_id = update.message.from_user.id
        
        # Парсим payload
        parts = payload.split("_")
        if len(parts) == 3 and parts[0] == "balance":
            stars_amount = int(parts[2])
            
            # Начисляем звёзды пользователю
            user_balances[user_id] = user_balances.get(user_id, 0) + stars_amount
            print(f"Пользователь {user_id} пополнил баланс на {stars_amount} звёзд. Баланс: {user_balances[user_id]}")
            
            # Здесь можно отправить уведомление пользователю или сохранить в БД
    
    # Передаём обновление в диспетчер для обработки pre-checkout
    await dp.feed_update(bot, update)
    return {"ok": True}

# Подключаем роутер
dp.include_router(router)
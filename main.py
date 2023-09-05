import os
import discord
from discord.ext import tasks, commands
from dotenv import load_dotenv
import http.client
import requests
from discord.ext import commands
import json

load_dotenv()

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix='?', intents=intents)
host = os.getenv("HOST")


@bot.event
async def on_ready():
    print('We have logged in as {0.user}'.format(bot))
    if not os.path.isfile("updates.txt"):
        file = open("updates.txt", "w")
        file.close()
        

def getConn():
    conn = http.client.HTTPSConnection(host)
    conn.request("HEAD", "/")
    response = conn.getresponse()
    return response




@tasks.loop(minutes=10)
async def update(ctx):
    response = getConn()
    
    oldTimer = json.loads(requests.get("http://localhost:3000/getTimer").content)["timerDate"]
    
    file = open("updates.txt", "r")
    last = ""
    try:
        last = file.readlines()[-1]
    except IndexError:
        last = "0#0"

    file.close()

    if last.split("#")[0] != response.getheader("Last-Modified"):
        file = open("updates.txt", "a")
        file.write(response.getheader("Last-Modified") +
                   "#" + response.getheader("Content-Length"))
        file.write("\n")
        file.close()
        await ctx.send("New Update: " + response.getheader("Last-Modified") + "\n" + "Size: " + last.split("#")[1] + " ----> " + response.getheader("Content-Length"))
    
    if oldTimer != json.loads(requests.get("http://localhost:3000/getTimer").content)["timerDate"]:
        oldTimer = json.loads(requests.get("http://localhost:3000/getTimer").content)["timerDate"]
        
        await ctx.send("Button pressed: " + str(oldTimer["year"]) + "/" + str(oldTimer["month"]).lower() + "/" + str(oldTimer["dayOfMonth"]) + "  " + str(oldTimer["hour"])+":"+str(oldTimer["minute"])+":"+ str(oldTimer["second"])) 
        
@bot.command()
async def button(ctx):
    oldTimer = json.loads(requests.get("http://localhost:3000/getTimer").content)["timerDate"]
    await ctx.send("Button pressed: " + str(oldTimer["year"]) + "/" + str(oldTimer["month"]).lower() + "/" + str(oldTimer["dayOfMonth"]) + "  " + str(oldTimer["hour"])+":"+str(oldTimer["minute"])+":"+ str(oldTimer["second"])) 
    
@bot.command()
async def start(ctx):
    if update.is_running():
        await ctx.send("Already Running")
    else:
        await ctx.send("Startet Task")
        update.start(ctx)
        
@bot.command()
async def stop(ctx):
    if update.is_running():
        await ctx.send("Task stopped")
        update.stop()
    else:
        await ctx.send("Already Stopped")



@bot.command()
async def status(ctx):
    try:
        response = getConn()
        await ctx.send("Jeremiasgalon.com Status: " + str(response.status) + " " + response.reason)

    except:
        await ctx.send("Error")


@bot.command()
async def last(ctx):
    response = getConn()
    await ctx.send("Last Update: " + response.getheader("Last-Modified") + "\n" + "Size: " + response.getheader("Content-Length"))


bot.run(os.getenv("TOKEN"))

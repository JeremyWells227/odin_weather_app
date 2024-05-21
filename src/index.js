import "./reset.css";
import "./style.css";



const API_KEY=process.env.WEATHER_API_KEY;
const API_URL_CURRENT="http://api.weatherapi.com/v1/current.json";
const API_URL_FORECAST="http://api.weatherapi.com/v1/forecast.json";


const CONDITION_TABLE = require('./resources/weather_conditions.json')

const UNLOADED = {
	condition: {code: -1},
	unloaded: true,
}


function getIcon(code){
	return CONDITION_TABLE.icon[code]
}

function getDayorNightDescFromCode(code,timeofDay){
	switch(timeofDay){
		case 'day':
			console.log(CONDITION_TABLE.day[code])
			return CONDITION_TABLE.day[code];
		case 'night':
			return CONDITION_TABLE.night.code;
		default:
			throw error("Invalid time of day")
	}
}

async function getCurrentWeather(query){
	query.key = API_KEY
	const payload = new URLSearchParams(query)
	let weatherData = await fetch(API_URL_CURRENT,{
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: payload
	})
	return weatherData.json()
}
async function getForecastWeather(query){
	query.key = API_KEY
	query.days = 3
	const payload = new URLSearchParams(query)
	let weatherData = await fetch(API_URL_FORECAST,{
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: payload
	})
	return weatherData.json()
}

function updateWeather(weatherData){
	const cards = [
		["current-card",weatherData.current],
		["todayfcst-card",weatherData.forecast.forecastday[0].day],
		["tomorrowfcst-card" ,weatherData.forecast.forecastday[1].day],
		["tomorrowtomorrowfcst-card",weatherData.forecast.forecastday[2].day]
	];
	cards.forEach((cardData)=>{
		let card = document.getElementById(cardData[0])
		updateCard(card,cardData[1])
	})
}

function updateCardLoading(card,data){
	let img = require("./resources/loading.gif")
	let imgElem = document.createElement('img')
	imgElem.src=img
	card.appendChild(imgElem)
}


function updateCard(card,data){
	card.innerHTML=""
	if(data.unloaded){
		updateCardLoading(card,data)
	} else {
		updateCardWeather(card,data)
	}
}

function generateIconTable(){
	let path = "./resources/icons/weather/64x64/day/"



}

function updateCardWeather(card,data){
	let head = document.createElement('h2')
	let cond = data.condition
	head.appendChild(document.createTextNode(
		getDayorNightDescFromCode(data.condition.code,'day')
	));
	let imgNum = getIcon(cond.code)
	console.log(imgNum)
	let img = require(path)	
	


	card.appendChild(head)

}


async function getInitialWeather(pos){
	const search = `${pos.coords.latitude},${pos.coords.longitude}`
	const forecastData = await getForecastWeather(
		{
			q: search
		}
	)
	updateWeather(forecastData);
}

async function getWeatherForCurrentLocation(){
	const options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0,
	} 
	navigator.geolocation.getCurrentPosition(getInitialWeather,(e)=>console.warn(e),options);
}

async function formSubmit(e){
	let search = e.target.value
	const forecastData = await getForecastWeather(
		{
			q: search
		}
	)
	updateForecast(forecastData);
}

async function initLoading(){
	const cards = [
		"current-card",
		"todayfcst-card",
		"tomorrowfcst-card",
		"tomorrowtomorrowfcst-card",
	]
	for (let cardName of cards){
		let card = document.getElementById(cardName);
		updateCard(card,UNLOADED)
	}
}


document.getElementById("searchForm").addEventListener('submit',formSubmit)

await initLoading()
await getWeatherForCurrentLocation()

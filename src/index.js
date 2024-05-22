import "./reset.css";
import "./style.css";



const API_KEY=process.env.WEATHER_API_KEY;
const API_URL_CURRENT="https://api.weatherapi.com/v1/current.json";
const API_URL_FORECAST="https://api.weatherapi.com/v1/forecast.json";
let icon_cache = {}
let is_metric = false

const CONDITION_TABLE = require('./resources/weather_conditions.json')

const UNLOADED = {
	condition: {code: -1},
	unloaded: true,
}
let curr_weather = UNLOADED


function getIcon(code,dayOrNight){
	let icon_code = CONDITION_TABLE.icon[code];
	let iconImg = document.createElement('img');
	iconImg.src = icon_cache[dayOrNight][icon_code];
	return iconImg;
	
	
}

function getDayorNightDescFromCode(code,timeofDay){
	switch(timeofDay){
		case 'day':
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
	curr_weather = weatherData
	const cards = [
		["current-card",weatherData.current,false],
		["todayfcst-card",weatherData.forecast.forecastday[0].day,true],
		["tomorrowfcst-card" ,weatherData.forecast.forecastday[1].day,true],
		["tomorrowtomorrowfcst-card",weatherData.forecast.forecastday[2].day,true]
	];
	cards.forEach((cardData)=>{
		let card = document.getElementById(cardData[0])
		updateCard(card,cardData[1],cardData[2])
	})
	updateLocation(weatherData.location)
}

function updateLocation(weatherData){
	let text = document.getElementById('location')
	if (Object.hasOwn(weatherData,'name')){
		text.innerHTML=""
		let locationtxt = `${weatherData.name}, ${weatherData.region} ${weatherData.country}`
		text.appendChild(document.createTextNode(locationtxt));
	}else {
		text.innerHTML=""
		text.appendChild(document.createTextNode("Loading"));
	} }

function updateCardLoading(card,data){
	let img = require("./resources/loading.gif")
	let imgElem = document.createElement('img')
	imgElem.src=img
	card.appendChild(imgElem)
}


function updateCard(card,data,isForecast){
	card.innerHTML=""
	if(data.unloaded){
		updateCardLoading(card,data)
	} else {
		updateCardWeather(card,data,isForecast)
	}
}

function isDayorNight(data){
	if (Object.hasOwn(data,'is_day')){
		if (data.is_day === 1){
			return 'day'
		}
		return 'night'
	}
	// Forecast data is always day
	return 'day'
}
function toggleMetric(){
	is_metric = !is_metric
	if ( is_metric ){
		document.getElementById('unit-toggle').innerText = "Standard"
	} else {
		document.getElementById('unit-toggle').innerText = "Metric"
	}
	updateWeather(curr_weather)
}


function updateCardWeather(card,data,isForecast){
	let head = document.createElement('h2')
	let cond = data.condition
	head.appendChild(document.createTextNode(
		getDayorNightDescFromCode(data.condition.code,'day')
	));
	let dayOrNight = isDayorNight(data)
	let icon = getIcon(cond.code,dayOrNight)
	card.appendChild(head)
	card.appendChild(icon)
	if (isForecast){
		let high = document.createElement('p')
		high.classList.add('high')
		let low = document.createElement('p')
		low.classList.add('low')
		if (is_metric){
			high.innerText = `H ${data.maxtemp_c} °C`
			low.innerText = `L ${data.mintemp_c} °C`
		}
		else{
			high.innerText = `H ${data.maxtemp_f} °F`
			low.innerText = `L ${data.mintemp_f} °F`
		}
		card.appendChild(high)
		card.appendChild(low)
		if(data.daily_will_it_rain){
			let rainChance = document.createElement('p')
			rainChance.innerText = `Chance of rain: ${data.daily_chance_of_rain}%`
			card.appendChild(rainChance)
		}
		if(data.daily_will_it_snow){
			let snowChance = document.createElement('p')
			snowChance.innerText = `Chance of snow: ${data.daily_chance_of_snow}%`
			card.appendChild(snowChance)
		}

	} else {
		let currTemp = document.createElement('p')
		if (is_metric){
			currTemp.innerText = `${data.temp_c} °C`
		}
		else{
			currTemp.innerText = `${data.temp_f} °F`
		}
		card.appendChild(currTemp)
	}
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
	e.preventDefault()
	let search = e.target[0].value
	const forecastData = await getForecastWeather(
		{
			q: search
		}
	)
	updateWeather(forecastData);
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

function loadIcons(r,timeofDay){
	icon_cache[timeofDay] ||= {}
	r.keys().forEach((key=>{
		let basename = key.split("/").reverse()[0]
		let noext_basename = basename.split(".")[0]
		icon_cache[timeofDay][noext_basename] = r(key)
	}))
}
loadIcons(require.context("./resources/icons/weather/64x64/day",true,/\.png/),'day')
loadIcons(require.context("./resources/icons/weather/64x64/night",true,/\.png/),'night')

document.getElementById("searchForm").addEventListener('submit',formSubmit)
document.getElementById('unit-toggle').addEventListener('click',toggleMetric)
await initLoading()
await getWeatherForCurrentLocation()

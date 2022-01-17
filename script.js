
ip = "http://127.0.0.1:8000/"
user_pass = {
    username:"gadi",
    password:"123456"
}

var last_typing = []

document.addEventListener("keyup", checkDelayTyping);


async function onStart(){
    await authenticate()
    await set_acc()
    checkUserAgent()
}

async function authenticate(){
    let url = ip + "auth"
    const response = await fetch(url, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify(user_pass)
      });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function sendSuspicious(){
    console.log('sendSuspicious')
    let url = ip + "suspicious"
    let message = `${new Date().getTime()/1000} | ${window.screen.availWidth}x${window.screen.availHeight}` 
    let data = {"data":message}
    const response = await fetch(url, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify(data)
      });
}

function checkUserAgent(){
    if (navigator.userAgent.includes('bot')) sendSuspicious()
}

function checkDelayTyping(event){
    last_typing.push(event.timeStamp)
    if (last_typing.length < 3) return
    console.log(last_typing.at(-1) - last_typing.at(-2))
    console.log(last_typing.at(-2) - last_typing.at(-3))
    if(last_typing.at(-1) - last_typing.at(-2) >= 1000 && last_typing.at(-1) - last_typing.at(-2) <= 2000 &&
        last_typing.at(-2) - last_typing.at(-3) >= 1000 && last_typing.at(-2) - last_typing.at(-3) <= 2000) sendSuspicious()
    else last_typing = [event.timeStamp]
}


async function get_reports() {
    let url = ip + "report"
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json()
}

async function get_car(id) {
    let url = ip + `car/${id}`
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json()
}

async function get_driver(id) {
    let url = ip + `driver/${id}`
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json()
}

async function get_car_type(id) {
    let url = ip + `car_type/${id}`
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json()
}


async function set_acc(){
    let reports = await get_reports()
    let max_car_value = -1
    let max_car_id = null
    reports.forEach(car_report => {
        if (car_report['braking'] + car_report['accelerating'] > max_car_value){
            max_car_id = car_report.car_id
        }
    })
    if (!max_car_id) return
    console.log(max_car_id)
    let car_obj = await get_car(max_car_id)
    car_obj = car_obj[0]
    console.log(car_obj)
    if (!car_obj) return
    let car_type_obj = await get_car_type(car_obj.car_type_id)
    let driver_obj = await get_driver(car_obj.driver_id)
    if (!car_type_obj || !driver_obj) return

    document.getElementById('maxCarType').innerText = car_type_obj[0].name
    document.getElementById('maxDriverName').innerText = driver_obj[0].name
}


async function getLatestAccidentsVector(){
    let x_y_coordinates = null
    let form_json = null
    let area_km = null
    let history_accidents_limit = null
    let url = ip + "report/latest_accidents_vector"
    try{
        area_km = parseFloat(document.getElementById('areaKM').value)
        history_accidents_limit = parseFloat(document.getElementById('historyLimit').value)
    }
    catch (error){
        console.log(error)
        return
    }

    if (!area_km || !history_accidents_limit) return
    console.log('here2')
    form_json = {"area_km":area_km, "history_accidents_limit":history_accidents_limit}
    const response = await fetch(url, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify(form_json)
      });
    x_y_coordinates = await response.json()
    document.getElementById('numOfAccidents').innerText = x_y_coordinates.number_of_accidents ?? ''
    document.getElementById('squareXY').innerText = `(${x_y_coordinates.X ?? ''}, ${x_y_coordinates.Y ?? ''})`
    document.getElementById('accidentsKM').style.visibility='visible'



}


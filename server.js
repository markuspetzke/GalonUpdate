import express from 'express'
import { doc, getDoc } from "firebase/firestore"
import db from "./init.js"
import convert from "color-convert"
import TuyAPI from 'tuyapi'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 3000
let oldTimer = 0;
let jsonTimer = 0;
let timeDoc = null;

function convertDecToHex(decimal, chars) { 
  return (decimal + Math.pow(16, chars)).toString(16).slice(-chars);
} ;

function convertRgbToHex(rgb) { 
  let hsv = convert.rgb.hsv(rgb); 
  let hex = hsv.map((data, index) => { 
      if(index === 0) { 
          return convertDecToHex(data, 4);
       } 
      else { 
          return convertDecToHex(data * 10, 4); 
      };
  });
  let hsvHex = hex.join(''); 
  return hsvHex; 
};

const device = new TuyAPI({
  id: process.env.DEVICEID,
  key: process.env.DEVICEKEY});

device.find().then(() => {
  device.connect();
});
device.on('connected', () => {
  console.log('Connected to device!');
});
device.on('disconnected', () => {
  console.log('Disconnected from device.');
});
device.on('error', error => {
  console.log('Error!', error);
});

app.get('/setColor/:r.:g.:b', async (req, res) => {
  device.set({
    multiple: true,
    data: {
        '21': 'colour',
        '24': convertRgbToHex([req.params["r"], req.params["g"], req.params["b"]]),
    }}).then(() => console.log('device was changed'))

    res.send('Color changed');
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/getdata', async (req, res) => {

    const json = JSON.stringify({title: timeDoc.data().name, startDate: timeDoc.data().startDate, endDate: timeDoc.data().endDate, desc: timeDoc.data().description})
    res.send(json);

})

app.get('/getTimer', async (req, res) => {


  if( timeDoc.data().timerDate > oldTimer )
  {
    jsonTimer = JSON.stringify({timerDate: timeDoc.data().timerDate})
    oldTimer = timeDoc.data().timerDate;
  }

  res.send(jsonTimer);
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  timeDoc = await getDoc(doc(db, 'Timer', 'values'));

  if(oldTimer == 0)
  {
    jsonTimer = JSON.stringify({timerDate: timeDoc.data().timerDate})
    oldTimer = timeDoc.data().timerDate;
  }
})
import express from 'express';
import { doc, getDoc } from "firebase/firestore"
import db from "./init.js"

const app = express()
const port = 3000
let oldTimer = 0;
let jsonTimer = 0;
let jsonData = null;
let timeDoc = null;

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
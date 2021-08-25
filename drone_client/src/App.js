import React, {useState, useEffect} from 'react'
import Map from './component/Map.js'
import Dashboard from './socketDashboard.js';
function App() {
  const [data, setData] = useState()  
  // useEffect(() => {
  //   fetch("/video_feed").then(
  //     res=>res.json()
  //   ).then(
  //     data=>{setData(data)
  //     console.log(data)}
  //   )    
  // }, [])
  return (
    <div>
      <img src="/video_feed"/>
      <Map></Map>
      {/* <Dashboard /> */}
    </div>
    
  )  
}

export default App

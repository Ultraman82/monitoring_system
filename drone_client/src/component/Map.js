/*global kakao*/
import React, { useState, useEffect } from 'react'
import io from 'socket.io-client';
const APP_KEY = '1f4b7f840486d6eaef49e9d86313f569'

const Map=()=>{
  const [map, setMap] = useState(null)    
  const [info, setInfo] = useState({lat:'35.8952442240333', lng:'128.514173961984'})              
  const [socket, setSocket] = useState({})              
  const [marker, setMarker] = useState(null)    

  

  const connectSocket = () => {
    const sensorEndpoint = "http://127.0.0.1:5000"
    const socket = io.connect(sensorEndpoint, {reconnection: true});
    socket.on("responseMessage", message => {                      
      if (message.lat !== undefined) {        
        setInfo(message)                        
        console.log(message)
      }          
    })    
  }

  const createMap = () => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&autoload=false`
    document.head.appendChild(script)
    script.onload = () => {
      const { kakao } = window
      kakao.maps.load(() => {
        let container = document.getElementById('map')
        let options = {
          center: new kakao.maps.LatLng(info.lat, info.lng),
          level: 1,
        }
        const createdMap = new kakao.maps.Map(container, options)
        createdMap.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
        
        setMap(createdMap)
        createMarker(true)
      })
    }
  }

  const createMarker = (is_fresh) => {   
    if (!is_fresh) {
      marker.setMap(null)
    }
    const { kakao } = window            
    const imageSrc = 'https://cdn2.iconfinder.com/data/icons/billing-shipping/100/Drone-512.png'
    const imageSize = new kakao.maps.Size(64, 69)
    const imageOption = {offset: new kakao.maps.Point(27, 69)}
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)
    const markerPosition = new kakao.maps.LatLng(info.lat, info.lng)    
    const createdMarker = new kakao.maps.Marker({
      position: markerPosition, 
      image: markerImage // 마커이미지 설정 
    });
    createdMarker.setMap(map); 
    setMarker(createdMarker)           
  } 
  
  const moveMap = () => {
    const { kakao } = window            
    const moveLatLon = new kakao.maps.LatLng(info.lat, info.lng)        
    map.panTo(moveLatLon)    
    createMarker(false)
    console.log('moveMapcalled' )    
  }   


  useEffect(() => {    
    createMap()
    connectSocket()    
    
    return () => {
      socket.close()
    }
  }, [])

  // marker 생성 + 표시
  useEffect(() => {
    if (map && info.meters > 1) {
      moveMap()  
    
    }    
    console.log('info changed')
  }, [
    // map,    
    info
  ]) 

    return (
        <div style={{ }}>
        	<div id="map" style={{width:"1000px", height:"600px"}}></div>           
        </div>
    )
}

export default Map;

// var container = document.getElementById('map');
      // var options = {
      //   center: new kakao.maps.LatLng(info.lat, info.lng),
      //   level: 1
      // };
      // var map = new kakao.maps.Map(container, options);    
      // map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
      // style = 'rotate(' + info.ang + 'deg)'

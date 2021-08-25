/*global kakao*/
import React from "react";
import io from 'socket.io-client';

class Dashboard extends React.Component {
    state = {
        lat: "",
        lng: "",
        socketStatus:"On"
    }
    componentWillUnmount() {
        this.socket.close()
        console.log("component unmounted")
    }
    componentDidMount() {        
        var sensorEndpoint = "http://127.0.0.1:5000"
            this.socket = io.connect(sensorEndpoint, {
            reconnection: true,
            // transports: ['websocket']
        });
        console.log("component mounted")
        this.socket.on("responseMessage", message => {                
            this.setState({'lat': message.lat, 'lng':message.lng})                
            console.log("responseMessage", message)
        })
            
    }
    handleEmit=()=>{
        if(this.state.socketStatus==="On"){
        this.socket.emit("message", {'data':'Stop Sending', 'status':'Off'})
        this.setState({'socketStatus':"Off"})
    }
    else{        
        this.socket.emit("message", {'data':'Start Sending', 'status':'On'})
        this.setState({'socketStatus':"On"})
        }
        console.log("Emit Clicked")
    }
    render() {
        return (
            <React.Fragment>
            <div id="map" style={{width:"1000px", height:"600px"}}></div> 
            <div>Latitue: {this.state.lat}</div>
            <div>Logitude: {this.state.lng}</div>
            <div>Status: {this.state.socketStatus}</div>
            <div onClick={this.handleEmit}> Start/Stop</div>
            </React.Fragment>
        )
    }
}
export default Dashboard;
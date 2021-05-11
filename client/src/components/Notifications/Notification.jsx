import React, { useContext } from 'react'
import {Button } from '@material-ui/core';
import {SocketContext} from '../../SocketContext'
const Notification=()=>{

    const {answerCall,call,callAccepted} = useContext(SocketContext);
    return(

        <>
            {console.log(call.isReceivedCall,callAccepted)} 
            
            {call.isRecievedCall && !callAccepted ?(
                
                <div style={{display:'flex',justifyContent:'center'}}>
                    <h1>HELLO</h1>
                    <h1>{call.name} is calling : </h1>

                    <Button variant="contained" color ="primary" onClick={answerCall}>

                        Answer



                    </Button>
                
                </div>
           ):null}
        </>
        
    )
}

export default Notification
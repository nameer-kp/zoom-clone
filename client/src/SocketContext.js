import React,{createContext,useState,useRef,useEffect} from 'react';

import {io} from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext=createContext()

const socket=io('http://localhost:5000');

const ContextProvider=({children})=>{

    const [stream,setStream]=useState(null);
    const [me,setMe] =useState("")
    const myVideo=useRef();
    const userVideo=useRef();
    const connectionRef=useRef();

    const[callEnded,setCallEnded]=useState(false);
    const[callAccepted,setCallAccepted]=useState(false);
    const[name,setName]=useState('')
    const [call,setCall]= useState({})

    useEffect(()=>{
        navigator.mediaDevices.getUserMedia({video:true,
            audio:true
        }).then((stream)=>{
            setStream(stream);

            myVideo.current.srcObject=stream

        })

        socket.on('me',(id)=>setMe(id));
        socket.on('calluser',({from,name,signal})=>{ 
            //this method trigger when we server emits 'calluser' to the caller
            console.log(from,name,signal)
           setCall({isReceivedCall:true,from,name,signal});
           console.log("sc calluser",call.isReceivedCall)

        })
    },[])    

    const answerCall =()=>{

            setCallAccepted(true)
            console.log("anser call")
            const peer =new Peer({initiator:false,trickle:false,stream:stream});

            peer.on('signal',(data)=>{
                socket.emit('answercall',{signal:data,to:call.from}); //this trigger ansercall on server then it will trigger call accepted on client (below)
            })

            peer.on('stream',(currentStream)=>{
                userVideo.current.srcObject=currentStream
            })
            peer.signal(call.signal)

            connectionRef.current=peer

    }

    const callUser=(id)=>{
        
        const peer =new Peer({initiator:true,trickle:false,stream:stream});
            
            peer.on('signal',(data)=>{
                socket.emit('calluser',{userToCall:id,signalData:data,from:me,name});
            })

            peer.on('stream',(currentStream)=>{
                userVideo.current.srcObject=currentStream
            })
            socket.on('callaccepted',(signal)=>{
                setCallAccepted(true);

                peer.signal(signal)  // we need to connect peer only if callaccepted triggers which in turn trigger by emit answer call from above
                
            })
            connectionRef.current=peer;
    }

    const leaveCall=()=>{
        setCallEnded(true);
        connectionRef.current.destroy();
    }

    return(

        <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall
        }}>

            {children}
        </SocketContext.Provider>
    )

}

export {ContextProvider,SocketContext}